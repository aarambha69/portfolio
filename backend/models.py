from pymongo import MongoClient
import os
import certifi

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "portfolio_db"

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client[DB_NAME]

# Collections
contact_messages = db["contact_messages"]
portfolio_content = db["portfolio_content"]
settings = db["settings"]
password_reset_otp = db["password_reset_otp"]
visitor_logs = db["visitor_logs"]

def init_db():
    # Initialize basic settings if they don't exist
    if settings.count_documents({"type": "admin_credentials"}) == 0:
        settings.insert_one({
            "type": "admin_credentials",
            "mobile": os.getenv("ADMIN_MOBILE", "9855062769"),
            "password": generate_password_hash(os.getenv("ADMIN_PASSWORD", "Admin@123")),
            "maintenance_mode": False,
            "site_title": "Aarambha Aryal",
            "site_description": "Personal VCard / Portfolio",
            "last_backup": None,
            "map_url": "https://maps.google.com/maps?width=600&height=400&hl=en&q=rijal%20food%20and%20beverage&t=&z=14&ie=UTF8&iwloc=B&output=embed",
            "social_links": [
                {"platform": "github", "url": "https://github.com/aarambhaaryal"},
                {"platform": "linkedin", "url": "https://linkedin.com/in/aarambhaaryal"},
                {"platform": "discord", "url": "#"}
            ]
        })
    
    # Initialize portfolio sections if empty
    if portfolio_content.count_documents({}) == 0:
        portfolio_content.insert_many([
            {
                "section": "personal_info",
                "content": {
                    "name": "Aarambha Aryal",
                    "role": "Flutter Developer",
                    "email": "aarambhaaryal.dev@gmail.com",
                    "phone": "+977 9855062769",
                    "birthday": "24 September, 2003",
                    "location": "Ratnanagar-3, Chitwan",
                    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarambha"
                }
            },
            {
                "section": "about",
                "content": {
                    "bio": "I am a Aarambha Aryal, an Flutter developer from Nepal, focused on building clean, high-quality applications. My work is driven by a passion for learning full stack development and exploring new technologies and tools.",
                    "services": [
                        {"title": "Web Design", "description": "The most modern and high-quality design made at a professional level.", "icon": "Layout"},
                        {"title": "Web Development", "description": "High-quality development of sites at the professional level.", "icon": "Code"},
                        {"title": "Mobile Apps", "description": "Professional development of applications for iOS and Android.", "icon": "Smartphone"},
                        {"title": "Photography", "description": "I make high-quality photos of any category at a professional level.", "icon": "Camera"}
                    ]
                }
            },
            {
                "section": "clients",
                "content": [
                    {"name": "Client 1", "logo": "https://via.placeholder.com/150", "url": "#"},
                    {"name": "Client 2", "logo": "https://via.placeholder.com/150", "url": "#"}
                ]
            },
            {
                "section": "resume",
                "content": {
                    "education": [
                        {"title": "University name", "date": "2010 — 2013", "description": "Nemo enims ipsam voluptatem, voldruptas sit aspernatur aut odit aut fugit, sed cursuxu luto."}
                    ],
                    "experience": [
                        {"title": "Creative director", "date": "2015 — Present", "description": "Nemo enims ipsam voluptatem, voldruptas sit aspernatur aut odit aut fugit, sed cursuxu luto."}
                    ],
                    "skills": [
                        {"name": "Web Design", "value": 80},
                        {"name": "Graphic Design", "value": 50},
                        {"name": "Writing", "value": 85},
                        {"name": "App Development", "value": 85}
                    ]
                }
            }
        ])
    
    # Initialize portfolio items specifically if missing
    if portfolio_content.count_documents({"section": "portfolio"}) == 0:
        portfolio_content.insert_one({
            "section": "portfolio",
            "content": [
                { "title": "Finance App", "category": "Web Development", "image": "https://api.dicebear.com/7.x/shapes/svg?seed=p1" },
                { "title": "Orizon", "category": "Web Design", "image": "https://api.dicebear.com/7.x/shapes/svg?seed=p2" },
                { "title": "Fundo", "category": "Web Design", "image": "https://api.dicebear.com/7.x/shapes/svg?seed=p3" },
                { "title": "Brawlhalla", "category": "App Development", "image": "https://api.dicebear.com/7.x/shapes/svg?seed=p4" }
            ]
        })
    
    # Initialize blog items specifically if missing
    if portfolio_content.count_documents({"section": "blog"}) == 0:
        portfolio_content.insert_one({
            "section": "blog",
            "content": []
        })
