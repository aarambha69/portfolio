import os, requests, time
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# CORS Configuration - Allow production domain and localhost for development
allowed_origins = [
    "https://aarambhaaryal.com.np",
    "https://www.aarambhaaryal.com.np",
    "http://aarambhaaryal.com.np",
    "http://www.aarambhaaryal.com.np",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

CORS(app, 
     resources={r"/*": {"origins": allowed_origins}}, 
     allow_headers=["Content-Type", "Authorization"], 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
     supports_credentials=False)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key") # Change in production
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/portfolio_db")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024 # 16 MB limit

from extensions import bcrypt, jwt, limiter
from auth import auth_bp, init_admin
from routes import api_bp
from models import init_db

bcrypt.init_app(app)
jwt.init_app(app)
limiter.init_app(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(api_bp, url_prefix="/api")

with app.app_context():
    init_db()
    init_admin()

@app.before_request
def log_visitor():
    # Skip logging for OPTIONS requests (CORS preflight)
    if request.method == "OPTIONS":
        return

    # Skip logging for static files, API calls (except home), admin, and broadcast
    if request.path.startswith('/static') or request.path.startswith('/api/auth') or request.path.startswith('/admin') or request.path.startswith('/api/broadcast-message'):
        return

    # Don't log internal API calls or specific static assets
    if any(request.path.endswith(ext) for ext in ['.ico', '.png', '.jpg', '.css', '.js']):
        return
        
    try:
        ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ',' in ip: ip = ip.split(',')[0]
        
        ua = request.headers.get('User-Agent', '')
        
        # Geolocation via free API (ip-api.com)
        geo_data = {}
        try:
            geo_resp = requests.get(f"http://ip-api.com/json/{ip}?fields=status,country,city,lat,lon", timeout=2).json()
            if geo_resp.get('status') == 'success':
                geo_data = {
                    "country": geo_resp.get('country'),
                    "city": geo_resp.get('city'),
                    "lat": geo_resp.get('lat'),
                    "lon": geo_resp.get('lon')
                }
        except:
            pass

        from models import visitor_logs
        visitor_logs.insert_one({
            "ip": ip,
            "ua": ua,
            "path": request.path,
            "timestamp": int(time.time()),
            **geo_data
        })
    except Exception as e:
        print(f"Logging error: {e}")

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200

# Serve Frontend Static Files (Production)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve the React frontend in production"""
    dist_dir = os.path.join(os.path.dirname(__file__), 'static', 'dist')
    
    # If path exists in dist directory, serve it
    if path and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    
    # Otherwise serve index.html (for SPA routing)
    if os.path.exists(os.path.join(dist_dir, 'index.html')):
        return send_from_directory(dist_dir, 'index.html')
    
    # Fallback if dist not built yet
    return jsonify({"message": "Frontend not built. Run 'npm run build' in frontend directory."}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)
