# SkillXchange - Setup Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL**
3. Both should show green status

### Step 2: Create Database
1. Open phpMyAdmin: **http://localhost/phpmyadmin**
2. Click **SQL** tab
3. Copy the entire content of `backend/database_setup.sql`
4. Paste and click **Go**
5. ✅ Database `skillxchange_db` will be created

### Step 3: Test Application
**Frontend:** http://localhost/WEBSWAP/project1/index.html

**Test Login:**
- Email: `test@example.com`
- Password: `password123`

---

## 📁 Project Structure

```
project1/
├── index.html          # Landing page
├── signup.html         # Registration page
├── signin.html         # Login page
├── home.html           # Home page (after login)
├── styles.css          # All styles
├── auth.js             # Authentication logic
├── home.js             # Home page logic
├── database.md         # Database documentation
│
└── backend/            # PHP Backend
    ├── config/
    │   ├── database.php    # DB connection
    │   └── cors.php        # CORS headers
    │
    ├── api/
    │   ├── signup.php      # Registration endpoint
    │   ├── signin.php      # Login endpoint
    │   ├── logout.php      # Logout endpoint
    │   └── check_auth.php  # Auth check
    │
    └── database_setup.sql  # ⭐ RUN THIS SQL FILE
```

---

## 📋 SQL Query to Run

**File Location:** `project1/backend/database_setup.sql`

**What it creates:**
- ✅ Database: `skillxchange_db`
- ✅ 10 tables (users, skills, categories, exchanges, etc.)
- ✅ Sample data (1 test user, 8 categories, 15 skills)
- ✅ Triggers and indexes

---

## 🔐 API Endpoints

**Base URL:** `http://localhost/WEBSWAP/project1/backend/api`

- `POST /signup.php` - Register new user
- `POST /signin.php` - Login user
- `POST /logout.php` - Logout user
- `GET /check_auth.php` - Check authentication

---

## ✅ Test Credentials

**Pre-created account:**
```
Email: test@example.com
Password: password123
```

---

## 🛠️ Configuration

**Database settings:** `backend/config/database.php`
```php
$host = "localhost";
$db_name = "skillxchange_db";
$username = "root";
$password = "";  // Default XAMPP
```

**API URL:** `auth.js`
```javascript
const API_BASE_URL = 'http://localhost/WEBSWAP/project1/backend/api';
```

---

## 🔍 Troubleshooting

### Database connection error?
- Check MySQL is running in XAMPP
- Verify database name: `skillxchange_db`
- Run the SQL script in phpMyAdmin

### Can't access localhost?
- Check Apache is running in XAMPP
- Use: `http://localhost/WEBSWAP/project1/index.html`
- NOT: `file:///C:/Users/...`

### Login not working?
- Make sure database is created
- Check browser console for errors
- Verify API_BASE_URL in auth.js

---

## 📊 Database Tables

1. **users** - User accounts
2. **skill_categories** - Skill categories  
3. **skills** - Available skills
4. **user_skills** - Skills users offer/seek
5. **exchanges** - Skill exchange requests
6. **reviews** - Ratings and reviews
7. **messages** - Direct messages
8. **notifications** - System notifications
9. **favorites** - Favorited users
10. **sessions** - Login sessions

---

## ✨ Features Implemented

✅ User registration with validation  
✅ User login with authentication  
✅ Password hashing (bcrypt)  
✅ Session management  
✅ SQL injection prevention  
✅ CORS configuration  

---

## 📞 Support

- **phpMyAdmin:** http://localhost/phpmyadmin
- **XAMPP Control:** C:\xampp\xampp-control.exe

---

**That's it! You're ready to use the application! 🎉**
