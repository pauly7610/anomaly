from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Transaction
from schemas import TransactionOut
import ml
import pandas as pd
from io import StringIO
from datetime import datetime
from utils.telemetry import anomaly_counter
from utils.alerts import send_email_alert
from fastapi import BackgroundTasks

router = APIRouter(prefix="/transactions", tags=["transactions"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from routes.auth_utils import get_current_user

@router.post("/upload", response_model=dict)
async def upload_transactions(file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_user), background_tasks: BackgroundTasks = None):
    """
    Upload a CSV or PDF containing transactions. Validates input, runs anomaly detection, and stores results.
    Returns number of inserted transactions, anomalies, and any row errors.
    """
    import pdfplumber
    import mimetypes
    import os
    import tempfile
    import pandas as pd
    from fastapi import status

    filename = file.filename.lower()
    content_type = file.content_type or mimetypes.guess_type(filename)[0]
    df = None
    errors = []

    # Read and parse file
    try:
        if filename.endswith('.csv') or (content_type and 'csv' in content_type):
            try:
                content = file.file.read().decode('utf-8')
            except Exception:
                raise HTTPException(status_code=400, detail="Could not decode CSV file. Ensure it's UTF-8 encoded.")
            try:
                df = pd.read_csv(StringIO(content))
            except Exception:
                raise HTTPException(status_code=400, detail="Could not parse CSV. Ensure it is a valid CSV file.")
        elif filename.endswith('.pdf') or (content_type and 'pdf' in content_type):
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
                tmp.write(file.file.read())
                tmp_path = tmp.name
            try:
                with pdfplumber.open(tmp_path) as pdf:
                    tables = []
                    for page in pdf.pages:
                        for table in page.extract_tables():
                            tables.append(table)
            except Exception:
                os.remove(tmp_path)
                raise HTTPException(status_code=400, detail="Could not parse PDF. Ensure it contains extractable tables.")
            os.remove(tmp_path)
            for table in tables:
                if table and table[0]:
                    headers = [h.strip().lower() for h in table[0]]
                    if set(['timestamp', 'amount', 'type', 'customer_id']).issubset(headers):
                        df = pd.DataFrame(table[1:], columns=table[0])
                        break
            if df is None:
                raise HTTPException(status_code=400, detail="No valid transaction table found in PDF.")
        else:
            raise HTTPException(status_code=400, detail="File must be CSV or PDF.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File processing error: {str(e)}")

    # Ensure required columns
    required = {'timestamp', 'amount', 'type', 'customer_id'}
    df.columns = [c.strip().lower() for c in df.columns]
    if not required.issubset(df.columns):
        raise HTTPException(status_code=400, detail=f"Missing required columns: {required - set(df.columns)}.")

    # Validate and convert columns
    def safe_parse(row, idx):
        try:
            ts = pd.to_datetime(row['timestamp'])
            amt = float(row['amount'])
            typ = str(row['type'])
            cid = str(row['customer_id'])
            return {'timestamp': ts, 'amount': amt, 'type': typ, 'customer_id': cid}, None
        except Exception as e:
            return None, f"Row {idx+1}: {str(e)}"

    valid_rows = []
    for idx, row in df.iterrows():
        parsed, err = safe_parse(row, idx)
        if parsed:
            valid_rows.append(parsed)
        else:
            errors.append(err)

    if not valid_rows:
        raise HTTPException(status_code=400, detail="No valid rows found in file.")

    clean_df = pd.DataFrame(valid_rows)
    # Run anomaly detection
    anomalies = ml.detect_anomalies(clean_df)
    clean_df['is_anomaly'] = anomalies
    # Store in DB
    for _, row in clean_df.iterrows():
        tx = Transaction(
            timestamp=row['timestamp'],
            amount=row['amount'],
            type=row['type'],
            customer_id=row['customer_id'],
            is_anomaly=bool(row['is_anomaly'])
        )
        db.add(tx)
    db.commit()
    return {
        "inserted": len(clean_df),
        "anomalies": sum(anomalies),
        "errors": errors
    }

from fastapi import Query

@router.get("/", response_model=list[TransactionOut])
def list_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    customer_id: str = None,
    is_anomaly: bool = None,
    start_date: str = None,
    end_date: str = None,
    type: str = None
):
    query = db.query(Transaction)
    if customer_id:
        query = query.filter(Transaction.customer_id == customer_id)
    if is_anomaly is not None:
        query = query.filter(Transaction.is_anomaly == is_anomaly)
    if type:
        query = query.filter(Transaction.type == type)
    if start_date:
        from datetime import datetime
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(Transaction.timestamp >= start_dt)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use ISO format.")
    if end_date:
        from datetime import datetime
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(Transaction.timestamp <= end_dt)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO format.")
    txs = query.order_by(Transaction.timestamp.desc()).offset(skip).limit(limit).all()
    return txs
