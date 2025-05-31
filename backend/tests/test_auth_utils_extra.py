import pytest
from routes import auth_utils
from fastapi import HTTPException
from unittest.mock import MagicMock

def test_get_db_yields_and_closes():
    # Should yield a db and close it
    gen = auth_utils.get_db()
    db = next(gen)
    assert db is not None
    try:
        next(gen)
    except StopIteration:
        pass
    else:
        assert False, "Generator should close after yielding"

def test_get_current_user_invalid_token(monkeypatch):
    # Should raise HTTPException for invalid token
    monkeypatch.setattr(auth_utils, "SECRET_KEY", "wrongkey")
    with pytest.raises(HTTPException):
        auth_utils.get_current_user(token="badtoken", db=MagicMock())
