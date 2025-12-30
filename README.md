# Portfolio CMS

A modern, full-featured Portfolio Content Management System built with React and Flask.

## Features

- 🎨 Modern Admin Dashboard
- 📝 Portfolio & Blog Management
- 📧 Contact Form with Message Inbox
- 📊 Analytics & Visitor Tracking
- 🔐 Google Authenticator 2FA
- 📱 SMS Broadcast System
- 📄 Resume/CV Management
- ⭐ Testimonials Management
- 🎯 Skills & Services Management
- 📤 Export to Excel
- 🖼️ Image Upload System
- 📱 Responsive Design

## Tech Stack

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Framer Motion
- Axios

**Backend:**
- Python/Flask
- MongoDB
- JWT Authentication
- Flask-CORS
- Gunicorn

## Deployment

This application is configured for deployment to **aarambhaaryal.com.np**.

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## Quick Start

### Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Production

See `PRODUCTION_READY.md` for deployment instructions.

## Documentation

- `PRODUCTION_READY.md` - Production deployment overview
- `DEPLOYMENT_GUIDE.md` - Step-by-step deployment guide
- `DEPLOY_README.md` - Quick reference
- `.agent/ADMIN_DASHBOARD_COMPLETE.md` - Features documentation

## Security

- JWT Authentication
- Password Hashing (bcrypt)
- Rate Limiting
- 2FA Support
- Environment Variables

## License

Private Project

## Author

Aarambha Aryal
