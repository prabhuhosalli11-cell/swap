# 🌟 SkillXchange - Production-Ready Skill Exchange Platform

A secure, modern web application for exchanging skills between users. Built with vanilla JavaScript, PHP, and MySQL with enterprise-grade security features.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/skillxchange)
[![PHP](https://img.shields.io/badge/PHP-7.4+-purple.svg)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-orange.svg)](https://mysql.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🚀 Quick Start

### Prerequisites
- XAMPP (Apache 2.4+ / PHP 7.4+ / MySQL 5.7+)
- Modern web browser (Chrome, Firefox, Edge)
- Text editor (VS Code recommended)

### Installation (5 minutes)

1. **Clone or download** this project to `C:\xampp\htdocs\project1`

2. **Start XAMPP** - Start Apache and MySQL

3. **Create database:**
   ```sql
   -- Open phpMyAdmin at http://localhost/phpmyadmin
   -- Run these SQL files in order:
   SOURCE C:/xampp/htdocs/project1/backend/database_setup.sql;
   SOURCE C:/xampp/htdocs/project1/backend/migrations/001_add_security_tables.sql;
   ```

4. **Access application:** `http://localhost/project1/index.html`

5. **Create account** with a strong password (min 8 chars, uppercase, lowercase, number, special char)

**Example password:** `Test123!@#`

✅ **Done!** See [QUICK_START.md](QUICK_START.md) for detailed instructions.

---

## 🎯 Features

### Core Functionality
- ✅ User registration with email validation
- ✅ Secure authentication with session management
- ✅ Protected dashboard with skill listings
- ✅ Search and filter skills by category
- ✅ User profiles with ratings
- ✅ Logout functionality

### 🔒 Production-Grade Security

#### Authentication & Authorization
- ✅ Bcrypt password hashing
- ✅ Session regeneration (prevents fixation)
- ✅ 2-hour session expiration
- ✅ Periodic session ID regeneration (every 10 min)
- ✅ Database-backed session validation

#### Attack Prevention
- ✅ **Rate Limiting** - 10 requests/minute per IP
- ✅ **Brute Force Protection** - 5 failed attempts = 15 min lockout
- ✅ **SQL Injection Protection** - Prepared statements
- ✅ **XSS Protection** - Input sanitization
- ✅ **CORS Security** - Origin whitelist
- ✅ **CSRF Ready** - Token framework in place

#### Password Security
- ✅ Minimum 8 characters
- ✅ Requires uppercase, lowercase, number, special character
- ✅ Client and server-side validation
- ✅ Strength meter feedback

#### Monitoring & Logging
- ✅ Comprehensive event logging
- ✅ Security violation tracking
- ✅ Failed login attempt tracking
- ✅ Automatic log rotation
- ✅ IP address and user agent logging

---

## 📁 Project Structure

```
project1/
│
├── Frontend (Client-Side)
│   ├── index.html          # Landing page
│   ├── signup.html         # User registration
│   ├── signin.html         # User login
│   ├── home.html           # Protected dashboard
│   ├── styles.css          # Complete styling
│   ├── auth.js             # Authentication logic
│   ├── home.js             # Home page functionality
│   └── check_auth.js       # Authentication verification
│
├── Backend (Server-Side)
│   └── backend/
│       ├── config/
│       │   ├── config.php         # Centralized configuration ⚙️
│       │   ├── cors.php           # CORS + session security 🔒
│       │   ├── database.php       # Database connection 💾
│       │   ├── security.php       # Security utilities 🛡️
│       │   └── logger.php         # Logging system 📝
│       │
│       ├── api/
│       │   ├── signup.php         # User registration endpoint
│       │   ├── signin.php         # User login endpoint
│       │   ├── check_auth.php     # Authentication check
│       │   └── logout.php         # User logout endpoint
│       │
│       ├── migrations/
│       │   └── 001_add_security_tables.sql
│       │
│       └── database_setup.sql     # Main database schema
│
├── Documentation
│   ├── README.md                  # This file
│   ├── QUICK_START.md             # 5-minute setup guide
│   ├── SECURITY_SUMMARY.md        # Security features overview
│   ├── PRODUCTION_DEPLOYMENT.md   # Production deployment guide
│   ├── DETAILS.md                 # Complete project documentation
│   ├── README_BACKEND.md          # Backend documentation
│   └── database.md                # Database schema details
│
├── Configuration
│   ├── .env.example        # Environment configuration template
│   └── .gitignore          # Git ignore rules
│
└── Logs (auto-created)
    └── logs/
        └── app.log         # Application logs
```

---

## 🗄️ Database Schema

### 10 Tables
1. **users** - User accounts and profiles
2. **skill_categories** - Skill categorization
3. **skills** - Available skills
4. **user_skills** - User skill offerings/seeking
5. **exchanges** - Skill exchange requests
6. **reviews** - User ratings and feedback
7. **messages** - Direct messaging
8. **notifications** - System notifications
9. **favorites** - Favorited users
10. **sessions** - Active user sessions
11. **login_attempts** - Failed login tracking (security)

See [database.md](database.md) for complete schema documentation.

---

## 🔐 Security Features

### Configuration (`backend/config/config.php`)

```php
// Security Settings
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_SPECIAL = true
MAX_LOGIN_ATTEMPTS = 5
LOGIN_LOCKOUT_DURATION = 900 seconds

// Rate Limiting
RATE_LIMIT_REQUESTS = 10
RATE_LIMIT_WINDOW = 60 seconds

// Session Security
SESSION_LIFETIME = 7200 seconds (2 hours)
SESSION_REGENERATE_INTERVAL = 600 seconds
```

### Security Utilities (`backend/config/security.php`)

- `generateCSRFToken()` - CSRF protection
- `checkRateLimit()` - Rate limiting
- `checkLoginAttempts()` - Brute force protection
- `sanitizeInput()` - XSS prevention
- `validatePassword()` - Password strength check
- `getClientIP()` - IP tracking
- `cleanExpiredSessions()` - Session cleanup

### Logging System (`backend/config/logger.php`)

```php
Logger::debug('Debug message');
Logger::info('Info message');
Logger::warning('Warning message');
Logger::error('Error message');
Logger::critical('Critical issue');
Logger::logAuth('LOGIN_SUCCESS', $email);
Logger::logSecurity('RATE_LIMIT_EXCEEDED', $details);
```

---

## 🧪 Testing

### Manual Testing

1. **Create Account**
   - Go to `signup.html`
   - Try weak password (should fail)
   - Use strong password: `Test123!@#`

2. **Test Rate Limiting**
   - Try logging in 15 times quickly
   - Should be rate limited after 10 attempts

3. **Test Brute Force Protection**
   - Try wrong password 6 times (wait 7 sec between attempts)
   - Should be locked out after 5 attempts

4. **Test Session Expiration**
   - Login and wait 2+ hours
   - Try to access `home.html` - should redirect to login

### Automated Testing (PowerShell)

```powershell
# Test weak password (should fail)
curl -X POST http://localhost/project1/backend/api/signup.php `
  -H "Content-Type: application/json" `
  -d '{\"fullName\":\"Test\",\"email\":\"test@test.com\",\"password\":\"weak\",\"confirmPassword\":\"weak\"}'

# Test rate limiting
1..15 | ForEach-Object {
    curl -s -X POST http://localhost/project1/backend/api/signin.php `
      -H "Content-Type: application/json" `
      -d '{\"email\":\"test@test.com\",\"password\":\"wrong\"}'
}
```

### Check Logs

```powershell
# View application logs
Get-Content logs\app.log -Tail 50

# Monitor in real-time
Get-Content logs\app.log -Wait

# Search for specific events
Select-String -Path logs\app.log -Pattern "LOGIN_FAILED"
```

---

## 📊 API Endpoints

### Authentication

#### POST `/backend/api/signup.php`
Register new user account.

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Test123!@#",
  "confirmPassword": "Test123!@#"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user_id": 5
}
```

#### POST `/backend/api/signin.php`
Authenticate user and create session.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "Test123!@#"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "user_id": 5,
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "token": "64-char-session-token"
}
```

#### GET `/backend/api/check_auth.php`
Verify authentication status.

**Response (200):**
```json
{
  "success": true,
  "isAuthenticated": true,
  "user": {
    "user_id": 5,
    "full_name": "John Doe",
    "email": "john@example.com",
    "rating": 4.5,
    "total_exchanges": 10
  }
}
```

#### POST `/backend/api/logout.php`
Destroy session and logout.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Update `ALLOWED_ORIGINS` in `config.php` with production domain
- [ ] Set `APP_ENV=production` and `APP_DEBUG=false`
- [ ] Configure `.env` file with production credentials
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure production database with dedicated user
- [ ] Set proper file permissions (755 dirs, 644 files)
- [ ] Configure Apache security headers
- [ ] Set up database backups
- [ ] Configure error logging
- [ ] Test all endpoints on staging

### Quick Production Setup

```bash
# 1. Update configuration
cp .env.example .env
nano .env  # Edit with production values

# 2. Update ALLOWED_ORIGINS in backend/config/config.php
define('ALLOWED_ORIGINS', ['https://yourdomain.com']);

# 3. Set file permissions
chmod 755 /var/www/project1
chmod 644 /var/www/project1/*.php

# 4. Create logs directory
mkdir logs && chmod 755 logs

# 5. Test configuration
php -l backend/config/config.php
```

📖 **See [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for complete deployment guide.**

---

## 🔧 Configuration

### Environment Variables (`.env`)

```env
APP_ENV=production
APP_DEBUG=false

DB_HOST=localhost
DB_NAME=skillxchange_db
DB_USER=skillxchange_user
DB_PASS=your_secure_password

COOKIE_DOMAIN=yourdomain.com
PRODUCTION_DOMAIN=https://yourdomain.com
```

### Configurable Settings

Edit `backend/config/config.php`:

```php
// Password Requirements
define('PASSWORD_MIN_LENGTH', 8);
define('PASSWORD_REQUIRE_SPECIAL', true);

// Login Security
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_DURATION', 900);

// Rate Limiting
define('RATE_LIMIT_REQUESTS', 10);
define('RATE_LIMIT_WINDOW', 60);

// Session
define('SESSION_LIFETIME', 3600 * 2);  // 2 hours
```

---

## 📝 Logs & Monitoring

### Log Locations

- **Application Logs:** `logs/app.log`
- **PHP Error Logs:** `C:\xampp\php\logs\php_error_log`
- **Apache Error Logs:** `C:\xampp\apache\logs\error.log`
- **MySQL Logs:** `C:\xampp\mysql\data\*.err`

### Log Levels

- **DEBUG** - Development debugging info
- **INFO** - Informational messages (login success)
- **WARNING** - Warning messages (failed login)
- **ERROR** - Errors (exceptions)
- **CRITICAL** - Critical issues (database failure)

### Security Monitoring

```powershell
# Failed logins
Select-String -Path logs\app.log -Pattern "LOGIN_FAILED"

# Rate limiting
Select-String -Path logs\app.log -Pattern "RATE_LIMIT_EXCEEDED"

# CORS violations
Select-String -Path logs\app.log -Pattern "CORS_VIOLATION"

# Critical errors
Select-String -Path logs\app.log -Pattern "CRITICAL"
```

---

## 🐛 Troubleshooting

### Common Issues

**Database connection failed**
- Start MySQL in XAMPP
- Run `database_setup.sql`
- Check credentials in `config.php`

**Session not persisting**
- Check cookies enabled in browser
- Verify `credentials: 'include'` in fetch calls
- Check DevTools → Application → Cookies

**Rate limited / Locked out**
- Wait 1 minute (rate limit) or 15 minutes (lockout)
- Or clear: `DELETE FROM login_attempts WHERE email='your@email.com'`

**CORS errors**
- Access via `http://localhost` (not file://)
- Add origin to `ALLOWED_ORIGINS` in `config.php`

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
- **[SECURITY_SUMMARY.md](SECURITY_SUMMARY.md)** - Security features
- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Deployment guide
- **[DETAILS.md](DETAILS.md)** - Complete project documentation
- **[database.md](database.md)** - Database schema
- **[README_BACKEND.md](README_BACKEND.md)** - Backend setup

---

## 🛠️ Technology Stack

### Frontend
- HTML5 (Semantic markup)
- CSS3 (Flexbox, Grid, Custom properties)
- JavaScript ES6+ (Fetch API, async/await)
- No frameworks - Pure vanilla JavaScript

### Backend
- PHP 7.4+ (OOP, PDO, Sessions)
- MySQL 5.7+ / MariaDB
- Apache 2.4+
- No frameworks - Pure PHP

### Development Tools
- XAMPP (Apache, MySQL, PHP)
- VS Code
- phpMyAdmin
- Git

---

## 🔒 Security Best Practices

✅ **OWASP Top 10 Protected**
- A01: Broken Access Control - Session validation
- A02: Cryptographic Failures - Bcrypt hashing
- A03: Injection - Prepared statements
- A04: Insecure Design - Security by design
- A05: Security Misconfiguration - Hardened config
- A06: Vulnerable Components - No dependencies
- A07: Authentication Failures - MFA ready
- A08: Data Integrity Failures - Input validation
- A09: Logging Failures - Comprehensive logging
- A10: SSRF - Not applicable

---

## 📈 Performance

- Session caching with APCu (if available)
- Database connection pooling
- Indexed database queries
- Automatic expired session cleanup
- Efficient rate limiting algorithm

---

## 🚧 Future Enhancements

### High Priority
- [ ] Email verification on signup
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] CSRF token implementation
- [ ] Content Security Policy headers

### Medium Priority
- [ ] Real-time messaging system
- [ ] Skill exchange workflow
- [ ] User profile pages
- [ ] Email notifications
- [ ] Admin dashboard

### Low Priority
- [ ] OAuth social login
- [ ] Mobile app (React Native)
- [ ] API rate limiting dashboard
- [ ] Analytics integration
- [ ] Multi-language support

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Support

- **Documentation:** See `/docs` folder
- **Issues:** Open GitHub issue
- **Security:** security@skillxchange.com

---

## 🏆 Credits

**Built by:** Your Name  
**Version:** 1.0.0 (Production-Ready)  
**Date:** November 12, 2025  
**Status:** ✅ Production-Ready

---

**⭐ Star this repo if you find it useful!**

