from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required
from models import contact_messages, portfolio_content, settings, visitor_logs
from extensions import limiter
from sms_service import sms_service
import time, datetime
import io
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side

api_bp = Blueprint("api", __name__)

# Contact Form
@api_bp.route("/contact", methods=["POST"])
@limiter.limit("3 per hour") # Spam protection
def submit_contact():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    reason = data.get("reason")
    message = data.get("message")

    if not all([name, email, phone, reason, message]):
        return jsonify({"error": "All fields are required"}), 400

    msg_id = contact_messages.insert_one({
        "name": name,
        "email": email,
        "phone": phone,
        "reason": reason,
        "message": message,
        "status": "unread",
        "timestamp": int(time.time())
    }).inserted_id

    # Send Notification to Admin
    admin_settings = settings.find_one({"type": "admin_credentials"})
    if admin_settings:
        admin_mobile = admin_settings.get("mobile")
        sms_body = f"Portfolio Msg ({reason})\nFrom: {name}\nEmail: {email}\nPhone: {phone}\nMsg: {message[:50]}..."
        sms_service.send_sms(admin_mobile, sms_body)

    return jsonify({"message": "Message sent successfully", "id": str(msg_id)}), 200

# Bulk SMS Route
@api_bp.route("/broadcast-message", methods=["POST"])
@jwt_required()
def send_bulk_sms():
    print("Hit /bulk-sms endpoint", flush=True)
    try:
        data = request.get_json()
        print(f"Received data: {data}", flush=True)
        numbers = data.get("numbers") # Expecting a list of strings or comma-separated string
        message = data.get("message")

        if not numbers or not message:
            print("Missing numbers or message", flush=True)
            return jsonify({"error": "Numbers and message are required"}), 400

        # Ensure numbers is a comma-separated string for AakashSMS
        if isinstance(numbers, list):
            to_str = ",".join(numbers)
        else:
            to_str = numbers
        
        print(f"Formatted numbers: {to_str}", flush=True)

        # Send SMS
        response = sms_service.send_sms(to_str, message)
        print(f"Service response: {response}", flush=True)
        
        return jsonify({"status": "processed", "api_response": response}), 200
    except Exception as e:
        print(f"Route Error: {e}", flush=True)
        return jsonify({"error": str(e)}), 500

# Portfolio Content
@api_bp.route("/content", methods=["GET"])
def get_content():
    content = list(portfolio_content.find({}, {"_id": 0}))
    return jsonify(content), 200

@api_bp.route("/content", methods=["POST"])
@jwt_required()
def update_content():
    data = request.get_json()
    section = data.get("section")
    content = data.get("content")

    portfolio_content.update_one(
        {"section": section},
        {"$set": {"content": content}},
        upsert=True
    )
    return jsonify({"message": f"Section {section} updated"}), 200

# Admin Inbox
@api_bp.route("/inbox", methods=["GET"])
@jwt_required()
def get_inbox():
    messages = list(contact_messages.find().sort("timestamp", -1))
    for m in messages:
        m["_id"] = str(m["_id"])
    return jsonify(messages), 200

@api_bp.route("/inbox/<msg_id>", methods=["PATCH"])
@jwt_required()
def update_message_status(msg_id):
    from bson import ObjectId
    status = request.get_json().get("status")
    contact_messages.update_one({"_id": ObjectId(msg_id)}, {"$set": {"status": status}})
    return jsonify({"message": "Status updated"}), 200

@api_bp.route("/inbox/<msg_id>", methods=["DELETE"])
@jwt_required()
def delete_message(msg_id):
    from bson import ObjectId
    contact_messages.delete_one({"_id": ObjectId(msg_id)})
    return jsonify({"message": "Message deleted"}), 200

@api_bp.route("/export-messages", methods=["GET"])
@jwt_required()
def export_messages():
    try:
        # Fetch all messages
        messages = list(contact_messages.find().sort("timestamp", -1))
        
        # Create a workbook and select the active worksheet
        wb = Workbook()
        ws = wb.active
        ws.title = "Contact Messages"
        
        # Set page setup for A4
        ws.page_setup.paperSize = 9 # A4
        ws.page_setup.orientation = 'landscape'
        ws.page_setup.fitToWidth = 1
        
        # Define headers
        headers = ["Date", "Name", "Email", "Phone", "Reason", "Message", "Status"]
        ws.append(headers)
        
        # Style headers
        for cell in ws[1]:
            cell.font = Font(bold=True)
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = Border(bottom=Side(style="thin"))
        
        # Add data
        for msg in messages:
            ws.append([
                datetime.datetime.fromtimestamp(msg.get("timestamp", 0)).strftime("%Y-%m-%d %H:%M:%S"),
                msg.get("name", ""),
                msg.get("email", ""),
                msg.get("phone", ""),
                msg.get("reason", ""),
                msg.get("message", ""),
                msg.get("status", "unread")
            ])
        
        # Auto-adjust column widths
        for col in ws.columns:
            max_length = 0
            column = col[0].column_letter # Get the column name
            for cell in col:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = (max_length + 2)
            ws.column_dimensions[column].width = min(adjusted_width, 50) # Cap width at 50

        # Save to BytesIO buffer
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"contact_messages_{datetime.datetime.now().strftime('%Y%m%d')}.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        print(f"Export Error: {e}", flush=True)
        return jsonify({"error": str(e)}), 500

# Admin Settings
@api_bp.route("/settings", methods=["GET"])
@jwt_required()
def get_settings():
    admin = settings.find_one({"type": "admin_credentials"}, {"_id": 0, "password": 0})
    return jsonify(admin), 200

# Public version for non-sensitive data
@api_bp.route("/settings_public", methods=["GET"])
def get_settings_public():
    admin = settings.find_one({"type": "admin_credentials"}, {"_id": 0, "password": 0, "mobile": 0})
    return jsonify(admin), 200

@api_bp.route("/settings", methods=["POST"])
@jwt_required()
def update_settings():
    data = request.get_json()
    update_fields = {}
    
    if "mobile" in data: update_fields["mobile"] = data["mobile"]
    if "maintenance_mode" in data: update_fields["maintenance_mode"] = data["maintenance_mode"]
    if "site_title" in data: update_fields["site_title"] = data["site_title"]
    if "site_description" in data: update_fields["site_description"] = data["site_description"]
    if "map_url" in data: update_fields["map_url"] = data["map_url"]
    if "social_links" in data: update_fields["social_links"] = data["social_links"]
    if "site_logo" in data: update_fields["site_logo"] = data["site_logo"]
    
    if not update_fields:
        return jsonify({"error": "No fields to update"}), 400

    settings.update_one(
        {"type": "admin_credentials"},
        {"$set": update_fields}
    )
    return jsonify({"message": "Settings updated", "updated_fields": update_fields}), 200

# File Upload Route
@api_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_file():
    print("Upload Endpoint Hit", flush=True)
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        # Create uploads directory if not exists
        upload_folder = os.path.join(os.getcwd(), 'static', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        filename = secure_filename(file.filename)
        # Add timestamp to prevent overwrite
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        new_filename = f"{timestamp}_{filename}"
        
        file.save(os.path.join(upload_folder, new_filename))
        
        # Return the URL - use environment variable for production or localhost for dev
        base_url = os.getenv("BASE_URL", "http://localhost:5000")
        file_url = f"{base_url}/static/uploads/{new_filename}"
        return jsonify({"url": file_url}), 200

# Client Content Routes
@api_bp.route("/backup", methods=["GET"])
@jwt_required()
def backup_data():
    # Fetch all data from collections
    data = {
        "portfolio_content": list(portfolio_content.find({}, {"_id": 0})),
        "settings": list(settings.find({}, {"_id": 0, "password": 0})),
        "contact_messages": list(contact_messages.find({}, {"_id": 0}))
    }
    return jsonify(data), 200

# Stronger Analytics (Aggregated)
@api_bp.route("/analytics", methods=["GET"])
@jwt_required()
def get_analytics():
    # 1. Recent Logs (last 20)
    recent_logs = list(visitor_logs.find().sort("timestamp", -1).limit(20))
    for log in recent_logs:
        log["_id"] = str(log["_id"])

    # 2. Daily Counts (Last 7 Days)
    now = datetime.datetime.now()
    daily_counts = []
    for i in range(7):
        date = now - datetime.timedelta(days=6-i)
        start_ts = int(date.replace(hour=0, minute=0, second=0, microsecond=0).timestamp())
        end_ts = int(date.replace(hour=23, minute=59, second=59).timestamp())
        
        count = visitor_logs.count_documents({
            "timestamp": {"$gte": start_ts, "$lte": end_ts}
        })
        daily_counts.append({"date": date.strftime("%a"), "count": count})

    # 3. Top Countries
    pipeline = [
        {"$match": {"country": {"$exists": True}}},
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_countries = list(visitor_logs.aggregate(pipeline))

    # 4. Total Stats
    total_views = visitor_logs.count_documents({})
    unique_visitors = len(visitor_logs.distinct("ip"))

    return jsonify({
        "recent": recent_logs,
        "daily": daily_counts,
        "top_countries": top_countries,
        "stats": {
            "total_views": total_views,
            "unique_visitors": unique_visitors
        }
    }), 200

@api_bp.route("/dashboard-stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    # Fetch Counts
    total_views = visitor_logs.count_documents({})
    
    # Portfolio projects count
    portfolio_data = portfolio_content.find_one({"section": "portfolio"})
    total_projects = len(portfolio_data.get("content", [])) if portfolio_data else 0

    # Blog posts count
    blog_data = portfolio_content.find_one({"section": "blog"})
    total_blogs = len(blog_data.get("content", [])) if blog_data else 0

    return jsonify({
        "total_views": total_views,
        "total_projects": total_projects,
        "total_blogs": total_blogs
    }), 200
