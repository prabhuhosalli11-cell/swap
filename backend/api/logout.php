<?php
/**
 * User Logout API
 * Handles user logout and session destruction with cleanup
 */

require_once '../config/cors.php';
require_once '../config/logger.php';

session_start();

// Log logout event
if (isset($_SESSION['user_id']) && isset($_SESSION['email'])) {
    Logger::logAuth('LOGOUT', $_SESSION['email'], true, "User ID: {$_SESSION['user_id']}");
}

// Destroy session
session_unset();
// If sessions are stored in DB, try to remove the session row as well
if (session_status() === PHP_SESSION_ACTIVE) {
    // Get token if present
    $session_token = isset($_SESSION['token']) ? $_SESSION['token'] : null;
}

session_unset();
session_destroy();

// Attempt to remove session row from DB if token was set
if (!empty($session_token)) {
    try {
        require_once '../config/database.php';
        $database = new Database();
        $conn = $database->getConnection();

        $delete_query = "DELETE FROM sessions WHERE session_id = :session_id";
        $del_stmt = $conn->prepare($delete_query);
        $del_stmt->bindParam(':session_id', $session_token);
        $del_stmt->execute();
    } catch (Exception $e) {
        // Log and continue; logout should not fail due to DB cleanup failure
        error_log('logout.php cleanup error: ' . $e->getMessage());
    }
}

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
?>
