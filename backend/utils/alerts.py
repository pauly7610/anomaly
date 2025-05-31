import smtplib
import os

def send_email_alert(anomalies: list):
    if not anomalies:
        return
    msg = f"Subject: Anomaly Alert\n\nDetected {len(anomalies)} anomalies:\n"
    msg += "\n".join([f"- {a}" for a in anomalies[:5]])
    with smtplib.SMTP(os.getenv("SMTP_HOST"), 587) as server:
        server.starttls()
        server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
        server.sendmail(
            os.getenv("ALERT_EMAIL"), 
            os.getenv("TEAM_EMAILS").split(","), 
            msg
        )
