# Deployment Guide for aarambhaaryal.com.np

## ✅ Production-Ready Status

Your Portfolio CMS is now **READY FOR DEPLOYMENT** to aarambhaaryal.com.np!

### What's Been Configured:

✅ **CORS** - Configured for aarambhaaryal.com.np (with and without www)
✅ **Frontend Build** - Production bundle created and copied to backend
✅ **API URLs** - Environment-based configuration (dev/prod)
✅ **Static File Serving** - Backend serves frontend automatically
✅ **File Uploads** - URLs use production domain
✅ **Environment Variables** - Production settings added

---

## 📦 Deployment Options

### Option 1: Single Server Deployment (Recommended for Nepal)

#### Requirements:
- VPS or Cloud Server (DigitalOcean, Linode, AWS EC2, etc.)
- Ubuntu 20.04/22.04 LTS
- Domain pointed to server IP (aarambhaaryal.com.np)

#### Step-by-Step Deployment:

**1. Prepare Server**
```bash
# SSH into your server
ssh root@your_server_ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.10+
sudo apt install python3 python3-pip python3-venv -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

**2. Upload Your Code**
```bash
# On your local machine, create a zip
cd d:\Portfolio
# Exclude node_modules and __pycache__
tar -czf portfolio.tar.gz backend/ --exclude='backend/__pycache__' --exclude='backend/static/uploads/*'

# Upload to server (use SCP or FileZilla)
scp portfolio.tar.gz root@your_server_ip:/var/www/

# On server, extract
cd /var/www
tar -xzf portfolio.tar.gz
cd backend
```

**3. Install Backend Dependencies**
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Create uploads directory
mkdir -p static/uploads
chmod 755 static/uploads
```

**4. Configure Environment**
```bash
# Edit .env file with production values
nano .env

# Ensure these are set:
# BASE_URL=https://aarambhaaryal.com.np
# FRONTEND_URL=https://aarambhaaryal.com.np
# MONGO_URI=your_mongodb_atlas_uri
# JWT_SECRET_KEY=your_strong_secret
```

**5. Create Systemd Service**
```bash
sudo nano /etc/systemd/system/portfolio.service
```

Paste this content:
```ini
[Unit]
Description=Portfolio CMS Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/backend
Environment="PATH=/var/www/backend/venv/bin"
ExecStart=/var/www/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start portfolio
sudo systemctl enable portfolio
sudo systemctl status portfolio
```

**6. Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/aarambhaaryal.com.np
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name aarambhaaryal.com.np www.aarambhaaryal.com.np;

    client_max_body_size 16M;

    # Serve static files directly
    location /static/ {
        alias /var/www/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (SPA)
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/aarambhaaryal.com.np /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**7. Setup SSL Certificate**
```bash
sudo certbot --nginx -d aarambhaaryal.com.np -d www.aarambhaaryal.com.np
```

Follow the prompts. Certbot will automatically configure HTTPS.

**8. Configure Firewall**
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

**9. Test Deployment**
Visit: https://aarambhaaryal.com.np

---

### Option 2: Platform-as-a-Service (PaaS)

#### Render.com Deployment

**Backend:**
1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect your GitHub repo
4. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`
   - Environment Variables: Copy from `.env`
5. Add custom domain: aarambhaaryal.com.np

**Frontend:**
Already bundled with backend! No separate deployment needed.

---

## 🔒 Security Checklist

Before going live, ensure:

- [ ] Strong JWT_SECRET_KEY (64+ random characters)
- [ ] Strong ADMIN_PASSWORD
- [ ] Enable 2FA for admin account after first login
- [ ] SSL certificate installed (HTTPS)
- [ ] Firewall configured (only ports 80, 443, 22)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Regular backups scheduled
- [ ] Monitor logs for suspicious activity

---

## 🧪 Testing Checklist

After deployment, test:

- [ ] Homepage loads at https://aarambhaaryal.com.np
- [ ] Admin login works at /admin/dashboard
- [ ] 2FA setup and login
- [ ] Image uploads work
- [ ] Contact form submissions
- [ ] SMS broadcast (if using Aakash SMS)
- [ ] All CRUD operations (Portfolio, Blog, etc.)
- [ ] Export to Excel
- [ ] Mobile responsiveness

---

## 📊 Monitoring

**Check Application Status:**
```bash
sudo systemctl status portfolio
```

**View Logs:**
```bash
sudo journalctl -u portfolio -f
```

**Nginx Logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Updating the Application

When you make changes:

```bash
# On local machine, rebuild frontend
cd d:\Portfolio\frontend
npm run build
xcopy /E /I /Y dist ..\backend\static\dist

# Upload to server
scp -r backend/static/dist root@your_server_ip:/var/www/backend/static/

# Restart service
ssh root@your_server_ip
sudo systemctl restart portfolio
```

---

## 🆘 Troubleshooting

**Issue: 502 Bad Gateway**
- Check if backend is running: `sudo systemctl status portfolio`
- Check logs: `sudo journalctl -u portfolio -f`

**Issue: CORS Errors**
- Verify domain in `backend/app.py` allowed_origins list
- Check browser console for exact error

**Issue: Images not loading**
- Check file permissions: `chmod 755 /var/www/backend/static/uploads`
- Verify BASE_URL in `.env`

**Issue: Database connection failed**
- Verify MONGO_URI in `.env`
- Check MongoDB Atlas IP whitelist (add server IP)

---

## 📞 Support

For deployment assistance:
- Check logs first
- Verify all environment variables
- Test locally before deploying

---

## 🎉 Your Application is Ready!

All production configurations are complete. Follow the deployment steps above to go live on **aarambhaaryal.com.np**.

**Next Steps:**
1. Choose deployment method (Option 1 or 2)
2. Follow the step-by-step guide
3. Test thoroughly
4. Enable 2FA for admin
5. Go live! 🚀
