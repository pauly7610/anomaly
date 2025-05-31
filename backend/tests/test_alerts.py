import pytest
import utils.alerts as alerts
import os
import smtplib
from unittest.mock import patch

def test_send_email_alert_no_anomalies():
    # Should not attempt to send an email if anomalies is empty
    with patch("smtplib.SMTP") as smtp_mock:
        alerts.send_email_alert([])
        smtp_mock.assert_not_called()

def test_send_email_alert_with_anomalies(monkeypatch):
    # Should attempt to send an email if anomalies are present
    monkeypatch.setenv("SMTP_HOST", "localhost")
    monkeypatch.setenv("SMTP_USER", "user")
    monkeypatch.setenv("SMTP_PASS", "pass")
    monkeypatch.setenv("ALERT_EMAIL", "alert@example.com")
    monkeypatch.setenv("TEAM_EMAILS", "team@example.com")
    with patch("smtplib.SMTP") as smtp_mock:
        smtp_instance = smtp_mock.return_value.__enter__.return_value
        alerts.send_email_alert(["anomaly1", "anomaly2"])
        smtp_mock.assert_called_once_with("localhost", 587)
        smtp_instance.starttls.assert_called_once()
        smtp_instance.login.assert_called_once_with("user", "pass")
        smtp_instance.sendmail.assert_called_once()
