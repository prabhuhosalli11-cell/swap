# SkillXchange - Production Deployment Guide

## 🚀 Production Deployment Checklist

### Pre-Deployment Security

#### 1. Environment Configuration
```bash
# Copy and configure environment file
cp .env.example .env
# Edit .env with production values
nano .env
```

**Critical settings to update in `.env`:**
- Set `APP_ENV=production`
- Set `APP_DEBUG=false`
- Update `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` with production database credentials
- Set `PRODUCTION_DOMAIN` to your actual domain
- Configure `COOKIE_DOMAIN` for your domain

#### 2. Update Configuration Files

**backend/config/config.php:**
- Verify `ALLOWED_ORIGINS` includes only your production domains
- Remove any localhost entries from production
- Set `SESSION_LIFETIME` appropriately (default: 2 hours)
- Ensure `PASSWORD_MIN_LENGTH >= 8` and `PASSWORD_REQUIRE_SPECIAL = true`

**Example production ALLOWED_ORIGINS:**
```php
define('ALLOWED_ORIGINS', [
    'https://skillxchange.com',
    'https://www.skillxchange.com',
]);
```

#### 3. Database Setup

```sql
-- 1. Create production database
CREATE DATABASE skillxchange_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Create dedicated database user (DO NOT USE root in production!)
CREATE USER 'skillxchange_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT SELECT, INSERT, UPDATE, DELETE ON skillxchange_db.* TO 'skillxchange_user'@'localhost';
FLUSH PRIVILEGES;

-- 3. Run main database setup
USE skillxchange_db;
SOURCE backend/database_setup.sql;

-- 4. Run security migrations
SOURCE backend/migrations/001_add_security_tables.sql;

-- 5. Verify tables created
SHOW TABLES;
```

#### 4. Server Configuration

**Apache (.htaccess):**
```apache
# Enable HTTPS redirect (if using SSL)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Disable directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "^\.env$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

**PHP Configuration (php.ini):**
```ini
# Session Security
session.cookie_httponly = 1
session.cookie_secure = 1  # Set to 1 if using HTTPS
session.use_strict_mode = 1
session.cookie_samesite = Strict

# Error Handling (Production)
display_errors = Off
display_startup_errors = Off
error_reporting = E_ALL
log_errors = On
error_log = /var/log/php_errors.log

# Security
expose_php = Off
allow_url_fopen = Off
allow_url_include = Off

# Upload limits
upload_max_filesize = 5M
post_max_size = 8M
max_execution_time = 30
```

#### 5. File Permissions

```bash
# Set proper ownership (adjust user/group for your server)
chown -R www-data:www-data /var/www/skillxchange

# Set directory permissions
find /var/www/skillxchange -type d -exec chmod 755 {} \;

# Set file permissions
find /var/www/skillxchange -type f -exec chmod 644 {} \;

# Create logs directory with write permissions
mkdir -p /var/www/skillxchange/logs
chmod 755 /var/www/skillxchange/logs

# Protect sensitive files
chmod 600 /var/www/skillxchange/.env
chmod 600 /var/www/skillxchange/backend/config/config.php
```

#### 6. SSL/TLS Certificate

**Option A: Let's Encrypt (Free)**
```bash
# Install certbot
sudo apt install certbot python3-certbot-apache

# Obtain certificate
sudo certbot --apache -d skillxchange.com -d www.skillxchange.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

**Option B: Commercial Certificate**
- Purchase SSL certificate from provider
- Install certificate on your server
- Configure Apache/Nginx to use certificate

#### 7. Frontend Configuration

**Update API URLs in JavaScript files:**

```javascript
// auth.js - Update API_BASE_URL
const API_BASE_URL = 'https://skillxchange.com/backend/api';

// check_auth.js - Update API_BASE_URL
const API_BASE_URL = 'https://skillxchange.com/backend/api';
```

**Or use environment detection:**
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost/project1/backend/api'
    : 'https://skillxchange.com/backend/api';
```

---

## 🔒 Security Hardening

### 1. Rate Limiting
- Enabled by default for login/signup endpoints
- Configure `RATE_LIMIT_REQUESTS` and `RATE_LIMIT_WINDOW` in config.php
- Consider using APCu for better performance

### 2. Brute Force Protection
- Automatically tracks failed login attempts
- Locks accounts after 5 failed attempts (configurable)
- 15-minute lockout duration (configurable)

### 3. Session Management
- Sessions expire after 2 hours (configurable)
- Automatic session regeneration every 10 minutes
- Session tokens stored in database
- Automatic cleanup of expired sessions

### 4. Password Security
- Minimum 8 characters (configurable)
- Requires uppercase, lowercase, number, special character
- Bcrypt hashing with automatic salt
- No password reuse checking (implement if needed)

### 5. CORS Security
- Whitelist-based origin validation
- Credentials only sent to whitelisted origins
- Logs CORS violations

### 6. Input Validation
- XSS protection via sanitization
- SQL injection protection via prepared statements
- Email validation
- Password strength validation

---

## 📊 Monitoring & Logging

### Log Files
```bash
# Application logs
tail -f logs/app.log

# PHP error logs
tail -f /var/log/php_errors.log

# Apache error logs
tail -f /var/log/apache2/error.log

# Apache access logs
tail -f /var/log/apache2/access.log
```

### Monitor Security Events
```bash
# Search for failed login attempts
grep "LOGIN_FAILED" logs/app.log

# Search for rate limit violations
grep "RATE_LIMIT_EXCEEDED" logs/app.log

# Search for CORS violations
grep "CORS_VIOLATION" logs/app.log

# Search for critical errors
grep "CRITICAL" logs/app.log
```

### Database Maintenance
```sql
-- Check failed login attempts
SELECT email, COUNT(*) as attempts, MAX(attempted_at) as last_attempt
FROM login_attempts
WHERE attempted_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY email
ORDER BY attempts DESC;

-- Check active sessions
SELECT COUNT(*) as active_sessions, 
       COUNT(DISTINCT user_id) as unique_users
FROM sessions
WHERE expires_at > NOW();

-- Clean up old data (run periodically)
DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
DELETE FROM sessions WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

---

## 🧪 Testing Checklist

### Before Going Live

- [ ] All database migrations completed
- [ ] Test user registration with strong password
- [ ] Test login with correct credentials
- [ ] Test login with incorrect credentials (verify lockout after 5 attempts)
- [ ] Test session expiration
- [ ] Test logout functionality
- [ ] Verify HTTPS redirect works
- [ ] Test CORS with production domain
- [ ] Verify rate limiting works (try 10+ requests in 1 minute)
- [ ] Check error logs show no critical errors
- [ ] Verify .env file is not accessible via browser
- [ ] Test all pages on mobile devices
- [ ] Run security scan (e.g., OWASP ZAP)
- [ ] Load test authentication endpoints

### Security Testing Commands

```bash
# Test rate limiting (should fail after 10 requests)
for i in {1..15}; do 
    curl -X POST https://skillxchange.com/backend/api/signin.php \
         -H "Content-Type: application/json" \
         -d '{"email":"test@example.com","password":"wrong"}' 
done

# Test CORS (should reject unknown origins in production)
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://skillxchange.com/backend/api/signin.php

# Test .env protection (should return 403)
curl -I https://skillxchange.com/.env
```

---

## 🔄 Post-Deployment

### Immediate Tasks
1. Monitor logs for first 24 hours
2. Test all critical paths with production domain
3. Verify email notifications (if enabled)
4. Check database connection pooling
5. Monitor server resources (CPU, memory, disk)

### Regular Maintenance
- **Daily**: Check error logs for critical issues
- **Weekly**: Review security logs, check disk space
- **Monthly**: Update dependencies, review user feedback
- **Quarterly**: Security audit, performance optimization

### Backup Strategy
```bash
# Database backup (run daily via cron)
mysqldump -u skillxchange_user -p skillxchange_db > backup_$(date +%Y%m%d).sql

# Compress and store
gzip backup_$(date +%Y%m%d).sql
mv backup_$(date +%Y%m%d).sql.gz /backups/

# Keep last 30 days
find /backups/ -name "backup_*.sql.gz" -mtime +30 -delete
```

---

## 🆘 Troubleshooting

### Common Issues

**1. CORS Errors**
- Check `ALLOWED_ORIGINS` in config.php
- Verify origin matches exactly (including protocol and port)
- Check browser console for exact error

**2. Session Not Persisting**
- Verify cookies are being set (check DevTools → Application → Cookies)
- Check `session.cookie_secure` matches your HTTPS setup
- Verify `COOKIE_DOMAIN` in .env is correct

**3. Database Connection Errors**
- Check database credentials in .env
- Verify database user has correct permissions
- Check MySQL is running: `sudo systemctl status mysql`

**4. Rate Limiting False Positives**
- Increase `RATE_LIMIT_REQUESTS` in config.php
- Clear APCu cache: `sudo service apache2 restart`
- Check if behind load balancer (IP detection may be wrong)

**5. Password Validation Fails**
- Verify frontend and backend password requirements match
- Check `PASSWORD_MIN_LENGTH` and `PASSWORD_REQUIRE_SPECIAL` in config.php
- Test with password: `Test123!@#`

---

## 📞 Support

For issues or questions:
1. Check logs first: `logs/app.log`
2. Review this deployment guide
3. Check database schema: `backend/database_setup.sql`
4. Review security configuration: `backend/config/config.php`

---

## 🔐 Security Contacts

**Report security vulnerabilities to:** security@skillxchange.com

**Response Time:** 24-48 hours for critical issues

---

**Deployment Date:** _______________________  
**Deployed By:** _______________________  
**Version:** 1.0.0 (Production)  
**Last Updated:** November 12, 2025
