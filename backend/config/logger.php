<?php
/**
 * Logging Utility
 * Centralized logging for security events, errors, and debugging
 */

require_once __DIR__ . '/security.php';

class Logger {
    
    private static $logLevels = [
        'DEBUG' => 0,
        'INFO' => 1,
        'WARNING' => 2,
        'ERROR' => 3,
        'CRITICAL' => 4
    ];
    
    /**
     * Write log entry
     */
    private static function log($level, $message, $context = []) {
        if (!LOG_ENABLED) {
            return;
        }
        
        $minLevel = self::$logLevels[LOG_LEVEL] ?? 0;
        $currentLevel = self::$logLevels[$level] ?? 0;
        
        if ($currentLevel < $minLevel) {
            return;
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $ip = SecurityUtils::getClientIP();
        $contextString = !empty($context) ? json_encode($context) : '';
        
        $logMessage = sprintf(
            "[%s] [%s] [IP: %s] %s %s\n",
            $timestamp,
            $level,
            $ip,
            $message,
            $contextString
        );
        
        // Ensure log directory exists
        $logDir = dirname(LOG_FILE);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        error_log($logMessage, 3, LOG_FILE);
        
        // Also log to PHP error log if critical
        if ($level === 'CRITICAL' || $level === 'ERROR') {
            error_log($message);
        }
    }
    
    public static function debug($message, $context = []) {
        self::log('DEBUG', $message, $context);
    }
    
    public static function info($message, $context = []) {
        self::log('INFO', $message, $context);
    }
    
    public static function warning($message, $context = []) {
        self::log('WARNING', $message, $context);
    }
    
    public static function error($message, $context = []) {
        self::log('ERROR', $message, $context);
    }
    
    public static function critical($message, $context = []) {
        self::log('CRITICAL', $message, $context);
    }
    
    /**
     * Log authentication events
     */
    public static function logAuth($event, $email, $success = true, $details = '') {
        $message = sprintf(
            "Auth Event: %s | Email: %s | Success: %s | Details: %s",
            $event,
            $email,
            $success ? 'YES' : 'NO',
            $details
        );
        
        if ($success) {
            self::info($message);
        } else {
            self::warning($message);
        }
    }
    
    /**
     * Log security events
     */
    public static function logSecurity($event, $details = []) {
        self::warning("Security Event: {$event}", $details);
    }
}
?>
