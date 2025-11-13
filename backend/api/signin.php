<?php
/**
 * User Sign In API
 * Handles user authentication with comprehensive security
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/security.php';
require_once '../config/logger.php';

// Start session
session_start();

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Rate limiting check
$clientIP = SecurityUtils::getClientIP();
if (!SecurityUtils::checkRateLimit($clientIP, 'login')) {
    Logger::logSecurity('RATE_LIMIT_EXCEEDED', ['action' => 'login', 'ip' => $clientIP]);
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => 'Too many requests. Please try again later.'
    ]);
    exit;
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required'
    ]);
    exit;
}

// Sanitize email
$data->email = SecurityUtils::sanitizeInput($data->email);

try {
    // Get database connection
    $database = new Database();
    $conn = $database->getConnection();

    // Check login attempts (brute force protection)
    $attemptsCheck = SecurityUtils::checkLoginAttempts($data->email, $conn);
    if (!$attemptsCheck['allowed']) {
        Logger::logSecurity('LOGIN_BLOCKED_ATTEMPTS', [
            'email' => $data->email,
            'ip' => $clientIP
        ]);
        
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => $attemptsCheck['message']
        ]);
        exit;
    }

    // Get user by email
    $query = "SELECT user_id, full_name, email, password_hash, account_status 
              FROM users 
              WHERE email = :email 
              LIMIT 1";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        // Record failed attempt
        SecurityUtils::recordLoginAttempt($data->email, $clientIP, $conn);
        Logger::logAuth('LOGIN_FAILED', $data->email, false, 'User not found');
        
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        exit;
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Check account status
    if ($user['account_status'] !== 'active') {
        Logger::logAuth('LOGIN_FAILED', $data->email, false, 'Account ' . $user['account_status']);
        
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Account is ' . $user['account_status']
        ]);
        exit;
    }

    // Verify password
    if (!password_verify($data->password, $user['password_hash'])) {
        // Record failed attempt
        SecurityUtils::recordLoginAttempt($data->email, $clientIP, $conn);
        Logger::logAuth('LOGIN_FAILED', $data->email, false, 'Invalid password');
        
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        exit;
    }

    // Clear previous failed attempts on successful login
    SecurityUtils::clearLoginAttempts($data->email, $conn);

        // Prevent session fixation: regenerate id on successful login
        session_regenerate_id(true);

        // Create session variables
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['email'] = $user['email'];

        // Generate session token (simple version) and store it in session
        $session_token = bin2hex(random_bytes(32));
        $_SESSION['token'] = $session_token;

    // Store session in database with IP and user agent
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $sessionLifetimeSeconds = SESSION_LIFETIME;
    
    $session_query = "INSERT INTO sessions (session_id, user_id, ip_address, user_agent, created_at, expires_at) 
                      VALUES (:session_id, :user_id, :ip_address, :user_agent, NOW(), DATE_ADD(NOW(), INTERVAL :lifetime SECOND))";
    $session_stmt = $conn->prepare($session_query);
    $session_stmt->bindParam(':session_id', $session_token);
    $session_stmt->bindParam(':user_id', $user['user_id']);
    $session_stmt->bindParam(':ip_address', $clientIP);
    $session_stmt->bindParam(':user_agent', $userAgent);
    $session_stmt->bindParam(':lifetime', $sessionLifetimeSeconds, PDO::PARAM_INT);
    $session_stmt->execute();

    // Update last login
    $update_query = "UPDATE users SET updated_at = NOW() WHERE user_id = :user_id";
    $update_stmt = $conn->prepare($update_query);
    $update_stmt->bindParam(':user_id', $user['user_id']);
    $update_stmt->execute();

    // Clean up old sessions periodically (10% chance)
    if (rand(1, 10) === 1) {
        SecurityUtils::cleanExpiredSessions($conn);
    }

    Logger::logAuth('LOGIN_SUCCESS', $data->email, true, "User ID: {$user['user_id']}, IP: {$clientIP}");

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'user_id' => $user['user_id'],
            'full_name' => $user['full_name'],
            'email' => $user['email']
        ],
        'token' => $session_token
    ]);

} catch (Exception $e) {
    Logger::error('signin.php exception: ' . $e->getMessage(), [
        'email' => $data->email ?? 'unknown',
        'ip' => $clientIP,
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => APP_DEBUG ? $e->getMessage() : 'Server error. Please try again later.'
    ]);
}
?>
