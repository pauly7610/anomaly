from fastapi import APIRouter, UploadFile, File, Depends
import pandas as pd
from opentelemetry import trace
from ml_extended import ensemble, drift_detector, shap_explain, auto_retrain
from routes.auth_utils import get_current_user
from sqlalchemy.orm import Session
from database import SessionLocal

tracer = trace.get_tracer(__name__)

router = APIRouter(prefix="/dashboard/ml_extended", tags=["ml-extended"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/ensemble_predict")
def ensemble_predict(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    with tracer.start_as_current_span("ensemble_predict"):
        df = pd.read_csv(file.file)
        preds = ensemble.predict(df)
        return {"predictions": preds.tolist()}

@router.post("/drift_detect")
def drift_detect(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    with tracer.start_as_current_span("drift_detect"):
        df = pd.read_csv(file.file)
        drift = drift_detector.detect(df)
        return {"drift_detected": bool(drift)}

@router.post("/shap_explain")
def shap_explain_api(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    with tracer.start_as_current_span("shap_explain"):
        df = pd.read_csv(file.file)
        shap_vals = shap_explain(df)
        return {"shap_values": shap_vals.tolist()}

@router.post("/auto_retrain")
def auto_retrain_api(file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    with tracer.start_as_current_span("auto_retrain_api"):
        df = pd.read_csv(file.file)
        result = auto_retrain(df)
        return result
