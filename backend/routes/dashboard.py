from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Transaction
import ml
from opentelemetry import trace
tracer = trace.get_tracer(__name__)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from routes.auth_utils import get_current_user

from sqlalchemy import func, desc
from datetime import datetime, timedelta

@router.get("/")
def dashboard_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    with tracer.start_as_current_span("dashboard_stats"):
        total = db.query(Transaction).count()
        anomalies = db.query(Transaction).filter(Transaction.is_anomaly == True).count()
        avg_amount = db.query(Transaction.amount).all()
        avg_amount = sum([x[0] for x in avg_amount]) / total if total else 0

        # 1. Volume over time (last 30 days)
        from datetime import timezone
        today = datetime.now(timezone.utc).date()
        start_day = today - timedelta(days=29)
        volume = db.query(
            func.date(Transaction.timestamp), func.count()
        ).filter(Transaction.timestamp >= start_day)
        volume = volume.group_by(func.date(Transaction.timestamp)).order_by(func.date(Transaction.timestamp)).all()
        volume_over_time = [
            {"date": str(day), "count": count} for day, count in volume
        ]

        # 2. Anomaly rate over time (last 30 days)
        anomaly_counts = db.query(
            func.date(Transaction.timestamp), func.count()
        ).filter(Transaction.timestamp >= start_day, Transaction.is_anomaly == True)
        anomaly_counts = anomaly_counts.group_by(func.date(Transaction.timestamp)).order_by(func.date(Transaction.timestamp)).all()
        anomaly_map = {str(day): count for day, count in anomaly_counts}
        total_map = {v["date"]: v["count"] for v in volume_over_time}
        anomaly_rate_over_time = [
            {"date": d, "rate": (anomaly_map.get(d, 0) / total_map[d]) if total_map[d] else 0}
            for d in total_map
        ]

        # 3. Top customers by total amount
        top_customers = db.query(
            Transaction.customer_id,
            func.sum(Transaction.amount).label("total_amount")
        ).group_by(Transaction.customer_id).order_by(desc("total_amount")).limit(5).all()
        top_customers = [
            {"customer_id": cid, "total_amount": float(amount)} for cid, amount in top_customers
        ]

        # 4. Type distribution
        type_dist = db.query(Transaction.type, func.count()).group_by(Transaction.type).all()

        # --- Business Metrics (last 30 days) ---
        try:
            tx_last_30 = db.query(Transaction).filter(Transaction.timestamp >= start_day).all()
            fin_anom = ml.financial_anomaly_severity_score(tx_last_30)
            vol_dev = ml.trading_volume_deviation_percentage(tx_last_30)
            comp_risk = ml.compliance_risk_score(tx_last_30)
        except Exception as e:
            fin_anom = vol_dev = comp_risk = None

        type_distribution = [
            {"type": t, "count": c} for t, c in type_dist
        ]

        # 5. Largest transactions
        largest = db.query(Transaction).order_by(desc(Transaction.amount)).limit(5).all()
        largest_transactions = [
            {
                "id": tx.id,
                "timestamp": tx.timestamp.isoformat(),
                "amount": float(tx.amount),
                "type": tx.type,
                "customer_id": tx.customer_id,
                "is_anomaly": tx.is_anomaly
            }
            for tx in largest
        ]

        # 6. Recent anomalies
        recent = db.query(Transaction).filter(Transaction.is_anomaly == True).order_by(desc(Transaction.timestamp)).limit(5).all()
        recent_anomalies = [
            {
                "id": tx.id,
                "timestamp": tx.timestamp.isoformat(),
                "amount": float(tx.amount),
                "type": tx.type,
                "customer_id": tx.customer_id
            }
            for tx in recent
        ]

        return {
            "total_transactions": total,
            "num_anomalies": anomalies,
            "average_amount": avg_amount,
            "volume_over_time": volume_over_time,
            "anomaly_rate_over_time": anomaly_rate_over_time,
            "top_customers": top_customers,
            "type_distribution": type_distribution,
            "largest_transactions": largest_transactions,
            "recent_anomalies": recent_anomalies,
            # --- New Business Metrics ---
            "financial_anomaly_severity_score": fin_anom,
            "trading_volume_deviation_percentage": vol_dev,
            "compliance_risk_score": comp_risk
        }

