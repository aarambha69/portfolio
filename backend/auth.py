import os
import random
import time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import settings, password_reset_otp
from extensions import bcrypt, limiter
from sms_service import sms_service

auth_bp = Blueprint("auth", __name__)

# Hardcoded Admin Credentials (Initial setup)
# In a real app, these would be moved to env or DB after first setup
ADMIN_MOBILE = os.getenv("ADMIN_MOBILE", "9860000000")
ADMIN_PASSWORD_HASH = bcrypt.generate_password_hash(os.getenv("ADMIN_PASSWORD", "Admin@123")).decode('utf-8')

def init_admin():
    if settings.count_documents({"type": "admin_credentials"}) == 0:
        settings.insert_one({
            "type": "admin_credentials",
            "mobile": ADMIN_MOBILE,
            "password": ADMIN_PASSWORD_HASH
        })

import pyotp
import qrcode
import io
import base64

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    mobile = data.get("mobile")
    password = data.get("password")
    totp_code = data.get("totp_code")

    admin = settings.find_one({"type": "admin_credentials"})
    if admin and admin["mobile"] == mobile and bcrypt.check_password_hash(admin["password"], password):
        
        # Check MFA
        if admin.get("totp_secret"):
            if not totp_code:
                return jsonify({"error": "mfa_required", "message": "Two-factor authentication code required"}), 403
            
            totp = pyotp.TOTP(admin["totp_secret"])
            if not totp.verify(totp_code):
                return jsonify({"error": "Invalid 2FA code"}), 401

        access_token = create_access_token(identity=mobile)
        return jsonify({"token": access_token}), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route("/setup-2fa", methods=["POST"])
@jwt_required()
def setup_2fa():
    # Generate random secret
    secret = pyotp.random_base32()
    
    # Generate QR Code
    # URI format: otpauth://totp/Issuer:AccountName?secret=SECRET&issuer=Issuer
    uri = pyotp.totp.TOTP(secret).provisioning_uri(name="Admin", issuer_name="Portfolio CMS")
    
    # Create QR code image
    img = qrcode.make(uri)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return jsonify({
        "secret": secret,
        "qr_code": f"data:image/png;base64,{img_str}"
    }), 200

@auth_bp.route("/verify-2fa-setup", methods=["POST"])
@jwt_required()
def verify_2fa_setup():
    data = request.get_json()
    secret = data.get("secret")
    token = data.get("token")
    
    totp = pyotp.TOTP(secret)
    if totp.verify(token):
        # Save secret to admin credentials
        settings.update_one(
            {"type": "admin_credentials"},
            {"$set": {"totp_secret": secret}}
        )
        return jsonify({"message": "2FA enabled successfully"}), 200
    
    return jsonify({"error": "Invalid code"}), 400

@auth_bp.route("/disable-2fa", methods=["POST"])
@jwt_required()
def disable_2fa():
    data = request.get_json()
    password = data.get("password")
    
    # verify password first for security
    admin = settings.find_one({"type": "admin_credentials"})
    if not bcrypt.check_password_hash(admin["password"], password):
        return jsonify({"error": "Invalid password"}), 401
        
    settings.update_one(
        {"type": "admin_credentials"},
        {"$unset": {"totp_secret": ""}}
    )
    return jsonify({"message": "2FA disabled successfully"}), 200

@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("3 per hour")
def forgot_password():
    data = request.get_json()
    mobile = data.get("mobile")

    admin = settings.find_one({"type": "admin_credentials"})
    if not admin or admin["mobile"] != mobile:
        # Don't reveal if mobile exists, but for admin-only site it's fine
        return jsonify({"message": "If the mobile is registered, you will receive an OTP."}), 200

    otp = str(random.randint(100000, 999999))
    expiry = int(time.time()) + 60 # 60 seconds expiry

    password_reset_otp.update_one(
        {"mobile": mobile},
        {"$set": {"otp": otp, "expiry": expiry, "attempts": 0}},
        upsert=True
    )

    sms_service.send_sms(mobile, f"Your OTP for password reset is {otp}. Valid for 60 seconds.")
    
    return jsonify({"message": "OTP sent successfully"}), 200

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    mobile = data.get("mobile")
    otp = data.get("otp")

    record = password_reset_otp.find_one({"mobile": mobile})
    if not record:
        return jsonify({"error": "No OTP found"}), 400

    if int(time.time()) > record["expiry"]:
        return jsonify({"error": "OTP expired"}), 400

    if record["attempts"] >= 3:
        return jsonify({"error": "Too many attempts. Request a new OTP."}), 400

    if record["otp"] == otp:
        # Return a temporary reset token or just allow setting password in next step
        # For simplicity, we'll return a success and the user can then call /reset-password
        # In a more secure way, we'd return a short-lived reset token
        return jsonify({"message": "OTP verified", "reset_token": "verified"}), 200
    
    password_reset_otp.update_one({"mobile": mobile}, {"$inc": {"attempts": 1}})
    return jsonify({"error": "Invalid OTP"}), 400

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    mobile = data.get("mobile")
    new_password = data.get("new_password")
    reset_token = data.get("reset_token")

    if reset_token != "verified":
        return jsonify({"error": "Unauthorized"}), 401

    new_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    settings.update_one(
        {"type": "admin_credentials"},
        {"$set": {"password": new_hash}}
    )
    
    # Clear OTP
    password_reset_otp.delete_one({"mobile": mobile})

    return jsonify({"message": "Password reset successfully"}), 200

@auth_bp.route("/request-mobile-change", methods=["POST"])
@jwt_required()
def request_mobile_change():
    admin = settings.find_one({"type": "admin_credentials"})
    if not admin:
        return jsonify({"error": "Admin not found"}), 404
    
    mobile = admin.get("mobile")
    otp = str(random.randint(100000, 999999))
    expiry = int(time.time()) + 120 # 2 mins expiry

    password_reset_otp.update_one(
        {"mobile": mobile},
        {"$set": {"otp": otp, "expiry": expiry, "attempts": 0, "type": "change_mobile"}},
        upsert=True
    )

    sms_service.send_sms(mobile, f"Your OTP to change admin mobile is {otp}. Do not share this.")
    return jsonify({"message": f"OTP sent to ending in {mobile[-4:]}"}), 200

@auth_bp.route("/verify-mobile-change", methods=["POST"])
@jwt_required()
def verify_mobile_change():
    data = request.get_json()
    otp = data.get("otp")
    new_mobile = data.get("new_mobile")

    if not new_mobile or len(new_mobile) != 10:
        return jsonify({"error": "Invalid new mobile number"}), 400

    admin = settings.find_one({"type": "admin_credentials"})
    current_mobile = admin.get("mobile")

    record = password_reset_otp.find_one({"mobile": current_mobile})
    
    if not record:
        return jsonify({"error": "No OTP request found"}), 400
    
    if int(time.time()) > record["expiry"]:
        return jsonify({"error": "OTP expired"}), 400
    
    if record.get("otp") != otp:
        password_reset_otp.update_one({"mobile": current_mobile}, {"$inc": {"attempts": 1}})
        return jsonify({"error": "Invalid OTP"}), 400

    # Success
    settings.update_one(
        {"type": "admin_credentials"},
        {"$set": {"mobile": new_mobile}}
    )
    password_reset_otp.delete_one({"mobile": current_mobile})

    return jsonify({"message": "Mobile number updated successfully"}), 200
