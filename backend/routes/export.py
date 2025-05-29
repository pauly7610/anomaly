from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Transaction
import csv
from io import StringIO

router = APIRouter(prefix="/export", tags=["export"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from routes.auth_utils import get_current_user

from fastapi import Query, HTTPException
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
import tempfile


def filter_transactions(db, customer_id, is_anomaly, start_date, end_date, type):
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
    return query.order_by(Transaction.timestamp.desc()).all()

@router.get("/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    customer_id: str = Query(None),
    is_anomaly: bool = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    type: str = Query(None)
):
    txs = filter_transactions(db, customer_id, is_anomaly, start_date, end_date, type)
    if not txs:
        raise HTTPException(status_code=404, detail="No transactions found for export.")
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "timestamp", "amount", "type", "customer_id", "is_anomaly"])
    for tx in txs:
        writer.writerow([
            tx.id,
            tx.timestamp,
            tx.amount,
            tx.type,
            tx.customer_id,
            tx.is_anomaly
        ])
    return Response(content=output.getvalue(), media_type="text/csv")

@router.get("/pdf")
def export_pdf(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    customer_id: str = Query(None),
    is_anomaly: bool = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    type: str = Query(None)
):
    txs = filter_transactions(db, customer_id, is_anomaly, start_date, end_date, type)
    if not txs:
        raise HTTPException(status_code=404, detail="No transactions found for export.")
    # Prepare table data
    data = [["ID", "Timestamp", "Amount", "Type", "Customer ID", "Is Anomaly"]]
    for tx in txs:
        data.append([
            str(tx.id),
            str(tx.timestamp),
            f"{tx.amount:.2f}",
            tx.type,
            tx.customer_id,
            str(tx.is_anomaly)
        ])
    # Generate PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        doc = SimpleDocTemplate(tmp.name, pagesize=letter)
        table = Table(data)
        style = TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.beige),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
        ])
        table.setStyle(style)
        doc.build([table])
        tmp.seek(0)
        pdf_bytes = tmp.read()
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=transactions.pdf"})
