# Portfolio CMS - Production Deployment Checklist

## ⚠️ CRITICAL ISSUES TO FIX BEFORE DEPLOYMENT

### 1. **CORS Configuration** ❌ BLOCKING DEPLOYMENT
**Current Issue**: Backend only allows `localhost:5173` (development)
**Location**: `backend/app.py` line 14

**Fix Required**:
```python
# BEFORE (Development):
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# AFTER (Production):
CORS(app, resources={r"/*": {"origins": [
    "https://yourdomain.com",  # Your production domain
    "http://localhost:5173"     # Keep for local testing
]}})
```

### 2. **Frontend Build Configuration** ❌ BLOCKING DEPLOYMENT
**Current Issue**: Frontend needs to be built for production and API URLs need updating

**Required Actions**:
1. Update API base URL in frontend code
2. Build production bundle
3. Configure backend to serve static files

---

## 🔧 REQUIRED CHANGES FOR PRODUCTION

### Backend (`backend/app.py`)

#### 1. Update CORS for Production Domain
```python
# Line 13-17
CORS(app, resources={r"/*": {"origins": [
    os.getenv("FRONTEND_URL", "https://yourdomain.com"),
    "http://localhost:5173"  # For local dev
]}}, 
     allow_headers=["Content-Type", "Authorization"], 
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
     supports_credentials=False)
```

#### 2. Add Static File Serving
```python
# After line 28, add:
from flask import send_from_directory

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path and os.path.exists(os.path.join('static/dist', path)):
        return send_from_directory('static/dist', path)
    return send_from_directory('static/dist', 'index.html')
```

#### 3. Update File Upload URLs
```python
# In routes.py line 249, change:
file_url = f"{os.getenv('BASE_URL', 'http://localhost:5000')}/static/uploads/{new_filename}"
```

### Frontend Configuration

#### 1. Create Production Environment File
**File**: `frontend/.env.production`
```env
VITE_API_URL=https://yourdomain.com/api
```

#### 2. Update API Calls to Use Environment Variable
**Create**: `frontend/src/config.js`
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

**Then replace all instances of** `http://localhost:5000` with `${API_BASE_URL}` in:
- `AdminDashboard.jsx`
- `Login.jsx`
- Any other components making API calls

#### 3. Build Frontend for Production
```bash
cd frontend
npm run build
```

This creates `frontend/dist/` folder with optimized production files.

### Environment Variables

#### Add to `backend/.env`:
```env
# Production Settings
FRONTEND_URL=https://yourdomain.com
BASE_URL=https://yourdomain.com
DEBUG=False
```

---

## ✅ ALREADY PRODUCTION-READY

### Security ✅
- ✅ JWT authentication with strong secret key
- ✅ Password hashing with bcrypt
- ✅ Rate limiting configured (2000/day, 500/hour)
- ✅ Google Authenticator 2FA support
- ✅ HTTPS-ready (no hardcoded HTTP)
- ✅ Sensitive data in `.env` file
- ✅ `.env` in `.gitignore`

### Database ✅
- ✅ MongoDB Atlas connection configured
- ✅ Connection string in environment variable
- ✅ Proper error handling

### File Structure ✅
- ✅ Modular backend (routes, models, auth separated)
- ✅ Clean frontend architecture
- ✅ Static file handling ready

---

## 📋 DEPLOYMENT STEPS

### Option 1: Deploy to Vercel (Frontend) + Render/Railway (Backend)

#### Backend (Render/Railway):
1. Push code to GitHub
2. Create new Web Service on Render
3. Set environment variables from `.env`
4. Deploy command: `pip install -r requirements.txt && python app.py`
5. Note the backend URL (e.g., `https://yourapp.onrender.com`)

#### Frontend (Vercel):
1. Update `VITE_API_URL` to backend URL
2. Run `npm run build`
3. Deploy `dist/` folder to Vercel
4. Or connect GitHub repo and auto-deploy

### Option 2: Single Server (VPS/Cloud)

1. **Install Dependencies**:
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   npm run build
   ```

2. **Copy Frontend Build to Backend**:
   ```bash
   mkdir -p backend/static
   cp -r frontend/dist backend/static/
   ```

3. **Use Production WSGI Server**:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

4. **Setup Nginx Reverse Proxy** (recommended)

---

## 🚨 SECURITY CHECKLIST BEFORE GOING LIVE

- [ ] Change `JWT_SECRET_KEY` to a new strong random value
- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Enable 2FA for admin account
- [ ] Set `DEBUG=False` in production
- [ ] Use HTTPS (SSL certificate)
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Add monitoring/logging
- [ ] Test all features in production environment
- [ ] Set up domain DNS records

---

## 📊 ESTIMATED DEPLOYMENT TIME

- **Quick Fix (CORS + Build)**: 15-30 minutes
- **Full Production Setup**: 1-2 hours
- **With Domain + SSL**: 2-3 hours

---

## ⚡ QUICK START (Minimum Changes)

If you want to deploy ASAP with minimal changes:

1. **Update CORS** in `backend/app.py` with your domain
2. **Build frontend**: `cd frontend && npm run build`
3. **Update API URLs** in frontend code to your backend URL
4. **Deploy backend** to Render/Railway with environment variables
5. **Deploy frontend** `dist/` folder to Vercel/Netlify

**Status**: NOT ready for production deployment yet. Requires the changes above.
