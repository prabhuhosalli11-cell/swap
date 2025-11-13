<?php
/**
 * User Sign Up API
 * Handles user registration with comprehensive security
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/security.php';
require_once '../config/logger.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Rate limiting check
$clientIP = SecurityUtils::getClientIP();
if (!SecurityUtils::checkRateLimit($clientIP, 'signup')) {
    Logger::logSecurity('RATE_LIMIT_EXCEEDED', ['action' => 'signup', 'ip' => $clientIP]);
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
if (
    empty($data->fullName) ||
    empty($data->email) ||
    empty($data->password) ||
    empty($data->confirmPassword)
) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required'
    ]);
    exit;
}

// Sanitize inputs
$data->fullName = SecurityUtils::sanitizeInput($data->fullName);
$data->email = SecurityUtils::sanitizeInput($data->email);

// Validate email format
if (!SecurityUtils::validateEmail($data->email)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email format'
    ]);
    exit;
}

// Validate password match
if ($data->password !== $data->confirmPassword) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Passwords do not match'
    ]);
    exit;
}

// Validate password strength
$passwordValidation = SecurityUtils::validatePassword($data->password);
if (!$passwordValidation['valid']) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Password requirements not met',
        'errors' => $passwordValidation['errors']
    ]);
    exit;
}

try {
    // Get database connection
    $database = new Database();
    $conn = $database->getConnection();

    // Check if email already exists
    $check_query = "SELECT user_id FROM users WHERE email = :email LIMIT 1";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bindParam(':email', $data->email);
    $check_stmt->execute();

    if ($check_stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Email already registered'
        ]);
        exit;
    }

    // Hash password
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    // Insert user
    $insert_query = "INSERT INTO users 
                    (full_name, email, password_hash, created_at) 
                    VALUES 
                    (:full_name, :email, :password_hash, NOW())";
    
    $insert_stmt = $conn->prepare($insert_query);
    $insert_stmt->bindParam(':full_name', $data->fullName);
    $insert_stmt->bindParam(':email', $data->email);
    $insert_stmt->bindParam(':password_hash', $password_hash);

    if ($insert_stmt->execute()) {
        $user_id = $conn->lastInsertId();
        
        Logger::logAuth('SIGNUP_SUCCESS', $data->email, true, "User ID: {$user_id}");
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'User registered successfully',
            'user_id' => $user_id
        ]);
    } else {
        Logger::error('Failed to insert user', ['email' => $data->email]);
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Unable to register user'
        ]);
    }

} catch (Exception $e) {
    Logger::error('signup.php exception: ' . $e->getMessage(), [
        'email' => $data->email ?? 'unknown',
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => APP_DEBUG ? $e->getMessage() : 'Server error. Please try again later.'
    ]);
}
?>
