import pytest
from routes import auth
from passlib.context import CryptContext

def test_verify_password_false():
    # Should return False for bad password
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed = pwd_context.hash("good")
    assert not auth.verify_password("bad", hashed)

def test_get_password_hash():
    # Should return a hash string
    hashed = auth.get_password_hash("password")
    assert isinstance(hashed, str) and len(hashed) > 0

def test_create_access_token_minimal():
    token = auth.create_access_token({"sub": "x"})
    assert isinstance(token, str)
