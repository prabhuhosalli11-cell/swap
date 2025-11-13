# 🎯 QUICK START - SkillXchange Backend

## ✅ 3 Simple Steps to Get Started

### Step 1: Start XAMPP
- Open XAMPP Control Panel
- Click **Start** for **Apache** ✓
- Click **Start** for **MySQL** ✓

### Step 2: Run SQL Script
1. Open: **http://localhost/phpmyadmin**
2. Click **"SQL"** tab
3. Open file: `project1/backend/database_setup.sql`
4. Copy **ENTIRE** content
5. Paste in SQL tab
6. Click **"Go"**
7. ✅ Done!

### Step 3: Run Security Migration
1. In phpMyAdmin, click **"SQL"** tab again
2. Open file: `project1/backend/migrations/001_add_security_tables.sql`
3. Copy content and paste
4. Click **"Go"**
5. ✅ Security tables added!

### Step 4: Test Application
**Open:** http://localhost/project1/index.html

**Create new account (strong password required):**
- Password must have: 8+ chars, uppercase, lowercase, number, special char
- Example: `Test123!@#`

**Or login with test user:**
- Email: `test@example.com`
- Password: `password123` (weak - for testing only)

---

## 🔒 Production Features Enabled

✅ **Rate Limiting** - Max 10 requests/minute per IP  
✅ **Brute Force Protection** - 5 failed login attempts = 15 min lockout  
✅ **Strong Passwords** - Min 8 chars, mixed case, numbers, special  
✅ **Session Security** - 2-hour expiration, auto-regeneration  
✅ **CORS Whitelist** - Only allowed origins accepted  
✅ **Comprehensive Logging** - Check `logs/app.log`  
✅ **XSS Protection** - All inputs sanitized  
✅ **SQL Injection Protection** - Prepared statements  

---

## 📁 Your Project Structure

```
project1/              ← YOUR MAIN FOLDER
├── index.html
├── signup.html
├── signin.html
├── home.html
├── styles.css
├── auth.js
├── home.js
└── backend/          ← BACKEND IS HERE
    ├── config/
    │   ├── database.php
    │   └── cors.php
    ├── api/
    │   ├── signup.php
    │   ├── signin.php
    │   ├── logout.php
    │   └── check_auth.php
    └── database_setup.sql  ⭐ RUN THIS!
```

---

## 📋 SQL File to Run

**Location:** `project1/backend/database_setup.sql`

**Creates:**
- Database: `skillxchange_db`
- 10 tables with sample data
- 1 test user (test@example.com / password123)

---

## ✅ Success Checklist

- [ ] XAMPP Apache & MySQL running (green)
- [ ] Ran database_setup.sql in phpMyAdmin
- [ ] Ran 001_add_security_tables.sql migration
- [ ] Can see `skillxchange_db` with `login_attempts` table
- [ ] Can open project1/index.html in browser
- [ ] Can create account with strong password
- [ ] Can login and access home.html
- [ ] Can logout using header button
- [ ] See logs being created in `logs/app.log`

---

## 🧪 Quick Tests

### Test Rate Limiting
Try logging in 15 times quickly with wrong password - should get rate limited after 10 attempts.

### Test Brute Force Protection
Try logging in 6 times with wrong password (wait 7 seconds between attempts to avoid rate limit) - should get locked out after 5 attempts.

### Check Logs
```powershell
Get-Content C:\xampp\htdocs\project1\logs\app.log -Tail 20
```

---

**All checked? You're done! 🚀**

**Need more details?**
- **Security features:** `SECURITY_SUMMARY.md`
- **Production deployment:** `PRODUCTION_DEPLOYMENT.md`
- **Backend setup:** `README_BACKEND.md`
- **Database schema:** `database.md`
