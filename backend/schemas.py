from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TransactionBase(BaseModel):
    timestamp: datetime
    amount: float
    type: str
    customer_id: str

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    is_anomaly: bool
    model_config = dict(from_attributes=True)

class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    model_config = dict(from_attributes=True)
