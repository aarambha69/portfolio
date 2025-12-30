import os
import requests

class AakashSMS:
    def __init__(self):
        self.token = os.getenv("AAKASH_SMS_TOKEN")
        self.base_url = "https://sms.aakashsms.com/sms/v3/send"

    def send_sms(self, to, message):
        if not self.token:
            print(f"SMS Simulation to {to}: {message}")
            return {"status": "simulated", "message": message}
        
        payload = {
            "auth_token": self.token,
            "to": to,
            "text": message
        }
        print(f"Sending SMS to {to} with payload: {payload}", flush=True)
        try:
            # Added verify=False to avoid SSL issues in local dev environments
            response = requests.post(self.base_url, data=payload, verify=False, timeout=10)
            print(f"AakashSMS Response Status: {response.status_code}", flush=True)
            print(f"AakashSMS Response Body: {response.text}", flush=True)
            return response.json()
        except Exception as e:
            print(f"SMS Sending Error: {e}", flush=True)
            return {"status": "error", "message": str(e)}

sms_service = AakashSMS()
