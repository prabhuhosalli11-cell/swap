<?php
/**
 * Delete Exchange API
 * Permanently deletes an exchange/connection from the database
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/security.php';
require_once '../config/logger.php';

session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (empty($data->exchange_id)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Exchange ID is required'
    ]);
    exit;
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    // First, get the exchange to verify permissions
    $check_query = "SELECT requester_id, provider_id, status 
                    FROM exchanges 
                    WHERE exchange_id = :exchange_id";
    
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bindParam(':exchange_id', $data->exchange_id);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Exchange not found'
        ]);
        exit;
    }
    
    $exchange = $check_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify user is part of this exchange
    if ($exchange['requester_id'] != $user_id && $exchange['provider_id'] != $user_id) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'You do not have permission to delete this exchange'
        ]);
        exit;
    }

    // Only allow deletion if status is pending, cancelled, or rejected
    $allowed_statuses = ['pending', 'cancelled', 'rejected'];
    if (!in_array($exchange['status'], $allowed_statuses)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Cannot delete an active or completed exchange. Please cancel it first.'
        ]);
        exit;
    }

    // Delete related notifications first (to maintain referential integrity)
    $delete_notif_query = "DELETE FROM notifications WHERE related_id = :exchange_id AND type LIKE '%exchange%'";
    $delete_notif_stmt = $conn->prepare($delete_notif_query);
    $delete_notif_stmt->bindParam(':exchange_id', $data->exchange_id);
    $delete_notif_stmt->execute();
    
    Logger::info("Deleted notifications for exchange", [
        'exchange_id' => $data->exchange_id,
        'notifications_deleted' => $delete_notif_stmt->rowCount()
    ]);

    // Now delete the exchange
    $delete_query = "DELETE FROM exchanges WHERE exchange_id = :exchange_id";
    $delete_stmt = $conn->prepare($delete_query);
    $delete_stmt->bindParam(':exchange_id', $data->exchange_id);
    
    if ($delete_stmt->execute()) {
        Logger::info("Exchange deleted permanently", [
            'exchange_id' => $data->exchange_id,
            'deleted_by_user_id' => $user_id,
            'was_requester' => $exchange['requester_id'] == $user_id
        ]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Connection deleted permanently'
        ]);
    } else {
        throw new Exception('Failed to delete exchange');
    }

} catch (Exception $e) {
    Logger::error('delete_exchange.php exception: ' . $e->getMessage(), [
        'trace' => $e->getTraceAsString(),
        'user_id' => $user_id ?? 'unknown',
        'exchange_id' => $data->exchange_id ?? 'unknown'
    ]);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error. Please try again later.'
    ]);
}
?>
