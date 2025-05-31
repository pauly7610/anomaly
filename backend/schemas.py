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
    is_fraud: bool = False
    fraud_reason: Optional[str] = None
    model_config = dict(from_attributes=True)

from pydantic import EmailStr, constr

class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=1)

class UserOut(BaseModel):
    id: int
    email: str
    model_config = dict(from_attributes=True)
