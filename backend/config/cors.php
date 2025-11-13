<?php
/**
 * CORS Configuration
 * Handles Cross-Origin Resource Sharing with whitelist
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/logger.php';

// Get the origin of the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Production-ready CORS with whitelist
$allowCredentials = false;

if (!empty($origin)) {
    // Check if origin is in whitelist
    if (in_array($origin, ALLOWED_ORIGINS, true)) {
        header("Access-Control-Allow-Origin: " . $origin);
        $allowCredentials = true;
    } else {
        // Origin not whitelisted
        Logger::logSecurity('CORS_VIOLATION', ['origin' => $origin]);
        
        // In development, log but allow
        if (APP_ENV === 'development') {
            header("Access-Control-Allow-Origin: " . $origin);
            $allowCredentials = true;
        } else {
            // In production, reject
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Origin not allowed'
            ]);
            exit;
        }
    }
} else {
    // No origin provided (file:// or same-origin requests)
    // Allow for development but log warning
    header("Access-Control-Allow-Origin: *");
    $allowCredentials = false;
    
    if (APP_ENV === 'development') {
        Logger::warning('Request from null origin (file://) - Please use http://localhost/project1/');
    }
}

// Only send credentials header when we're reflecting an origin
if ($allowCredentials) {
    header("Access-Control-Allow-Credentials: true");
}

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Recommended: set secure session cookie params for development here (must be before session_start()).
// Adjust 'secure' => true when you enable HTTPS in production.
session_set_cookie_params([
    'lifetime' => 0,         // session cookie
    'path' => '/',
    'domain' => '',
    'secure' => false,       // set true in production with HTTPS
    'httponly' => true,
    'samesite' => 'Lax'      // change to 'Strict' or 'None' as appropriate
]);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Respond with allowed headers/methods; body not required
    http_response_code(200);
    exit();
}
?>
