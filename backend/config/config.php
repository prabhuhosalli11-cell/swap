<?php
/**
 * Production Configuration File
 * Centralized configuration for all environment settings
 * 
 * SECURITY: Store sensitive values in environment variables or .env file
 * DO NOT commit secrets to version control
 */

// Environment setting (development, staging, production)
define('APP_ENV', getenv('APP_ENV') ?: 'development');
define('APP_DEBUG', APP_ENV !== 'production');

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'skillxchange_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// Security Configuration
define('SESSION_LIFETIME', 3600 * 2); // 2 hours
define('SESSION_REGENERATE_INTERVAL', 600); // 10 minutes
define('PASSWORD_MIN_LENGTH', 8);
define('PASSWORD_REQUIRE_SPECIAL', true);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_DURATION', 900); // 15 minutes

// CSRF Protection
define('CSRF_TOKEN_LENGTH', 32);
define('CSRF_TOKEN_EXPIRE', 3600); // 1 hour

// Rate Limiting
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_REQUESTS', 10);
define('RATE_LIMIT_WINDOW', 60); // 1 minute

// CORS Configuration (whitelist for production)
define('ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'https://yourdomain.com', // Replace with actual production domain
]);

// Session Cookie Configuration
$sessionConfig = [
    'lifetime' => SESSION_LIFETIME,
    'path' => '/',
    'domain' => getenv('COOKIE_DOMAIN') ?: '',
    'secure' => APP_ENV === 'production', // HTTPS only in production
    'httponly' => true,
    'samesite' => 'Strict', // or 'Lax' if cross-site needed
];

// Logging Configuration
define('LOG_ENABLED', true);
define('LOG_FILE', __DIR__ . '/../../logs/app.log');
define('LOG_LEVEL', APP_ENV === 'production' ? 'ERROR' : 'DEBUG');

// Email Configuration (for password reset, notifications)
define('MAIL_ENABLED', false); // Set true when configured
define('MAIL_FROM', 'noreply@skillxchange.com');
define('MAIL_FROM_NAME', 'SkillXchange');

// API Configuration
define('API_VERSION', 'v1');
define('API_TIMEOUT', 30);

// Feature Flags
define('FEATURE_EMAIL_VERIFICATION', false);
define('FEATURE_TWO_FACTOR_AUTH', false);
define('FEATURE_SOCIAL_LOGIN', false);

return $sessionConfig;
?>
