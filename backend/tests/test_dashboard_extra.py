import pytest
from routes import dashboard

def test_get_db_yields_and_closes():
    gen = dashboard.get_db()
    db = next(gen)
    assert db is not None
    try:
        next(gen)
    except StopIteration:
        pass
    else:
        assert False, "Generator should close after yielding"
