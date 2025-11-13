<?php
/**
 * Check Authentication API
 * Verifies if user is logged in with session validation
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/security.php';
require_once '../config/logger.php';

session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id']) || !isset($_SESSION['token'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Not authenticated',
        'isAuthenticated' => false
    ]);
    exit;
}

// Regenerate session ID periodically for security
if (!isset($_SESSION['last_regeneration'])) {
    $_SESSION['last_regeneration'] = time();
} elseif (time() - $_SESSION['last_regeneration'] > SESSION_REGENERATE_INTERVAL) {
    session_regenerate_id(true);
    $_SESSION['last_regeneration'] = time();
}

try {
    // Get database connection
    $database = new Database();
    $conn = $database->getConnection();

    // Get user details
    $query = "SELECT user_id, full_name, email, profile_picture, rating, total_exchanges 
              FROM users 
              WHERE user_id = :user_id AND account_status = 'active' 
              LIMIT 1";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        Logger::warning('Auth check failed - user not found or inactive', [
            'user_id' => $_SESSION['user_id']
        ]);
        
        session_destroy();
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'User not found or inactive',
            'isAuthenticated' => false
        ]);
        exit;
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify session exists in database and hasn't expired
    $session_check = "SELECT session_id FROM sessions 
                      WHERE session_id = :token 
                      AND user_id = :user_id 
                      AND expires_at > NOW() 
                      LIMIT 1";
    $session_stmt = $conn->prepare($session_check);
    $session_stmt->bindParam(':token', $_SESSION['token']);
    $session_stmt->bindParam(':user_id', $_SESSION['user_id']);
    $session_stmt->execute();

    if ($session_stmt->rowCount() === 0) {
        Logger::warning('Session expired or invalid', [
            'user_id' => $_SESSION['user_id']
        ]);
        
        session_destroy();
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Session expired',
            'isAuthenticated' => false
        ]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'isAuthenticated' => true,
        'user' => $user
    ]);

} catch (Exception $e) {
    Logger::error('check_auth.php exception: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => APP_DEBUG ? $e->getMessage() : 'Server error'
    ]);
}
?>
