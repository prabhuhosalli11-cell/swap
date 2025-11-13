<?php
/**
 * Update Exchange API
 * Updates the status and details of an exchange/connection
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
            'message' => 'You do not have permission to update this exchange'
        ]);
        exit;
    }

    // Build update query based on provided fields
    $update_fields = [];
    $params = [':exchange_id' => $data->exchange_id];
    
    // Update status if provided
    if (isset($data->status)) {
        $allowed_statuses = ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];
        
        if (!in_array($data->status, $allowed_statuses)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid status value'
            ]);
            exit;
        }
        
        // Additional permission checks based on status change
        if ($data->status === 'accepted' || $data->status === 'rejected') {
            // Only provider can accept/reject
            if ($exchange['provider_id'] != $user_id) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Only the provider can accept or reject this request'
                ]);
                exit;
            }
        }
        
        $update_fields[] = "status = :status";
        $params[':status'] = $data->status;
        
        // Set completed_at timestamp if status is completed
        if ($data->status === 'completed') {
            $update_fields[] = "completed_at = NOW()";
        }
    }
    
    // Update start_date if provided
    if (isset($data->start_date)) {
        $update_fields[] = "start_date = :start_date";
        $params[':start_date'] = $data->start_date;
    }
    
    // Update end_date if provided
    if (isset($data->end_date)) {
        $update_fields[] = "end_date = :end_date";
        $params[':end_date'] = $data->end_date;
    }
    
    // Update meeting_preference if provided
    if (isset($data->meeting_preference)) {
        $allowed_preferences = ['online', 'in_person', 'hybrid'];
        
        if (!in_array($data->meeting_preference, $allowed_preferences)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid meeting preference'
            ]);
            exit;
        }
        
        $update_fields[] = "meeting_preference = :meeting_preference";
        $params[':meeting_preference'] = $data->meeting_preference;
    }
    
    // Update message if provided
    if (isset($data->message)) {
        $update_fields[] = "message = :message";
        $params[':message'] = $data->message;
    }
    
    // If no fields to update
    if (empty($update_fields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No fields to update'
        ]);
        exit;
    }
    
    // Always update the updated_at timestamp
    $update_fields[] = "updated_at = NOW()";
    
    // Build and execute update query
    $update_query = "UPDATE exchanges 
                     SET " . implode(', ', $update_fields) . " 
                     WHERE exchange_id = :exchange_id";
    
    $update_stmt = $conn->prepare($update_query);
    
    foreach ($params as $key => $value) {
        $update_stmt->bindValue($key, $value);
    }
    
    if ($update_stmt->execute()) {
        // Create notification if status changed to accepted
        if (isset($data->status) && $data->status === 'accepted') {
            // Notify the requester
            $notif_query = "INSERT INTO notifications 
                            (user_id, type, title, message, related_id) 
                            VALUES 
                            (:user_id, 'exchange_accepted', :title, :notif_message, :exchange_id)";
            
            $notif_stmt = $conn->prepare($notif_query);
            
            // Get provider name
            $name_query = "SELECT full_name FROM users WHERE user_id = :user_id";
            $name_stmt = $conn->prepare($name_query);
            $name_stmt->bindParam(':user_id', $user_id);
            $name_stmt->execute();
            $provider = $name_stmt->fetch(PDO::FETCH_ASSOC);
            
            $title = 'Connection Accepted!';
            $notif_message = $provider['full_name'] . ' accepted your connection request!';
            
            $notif_stmt->bindParam(':user_id', $exchange['requester_id']);
            $notif_stmt->bindParam(':title', $title);
            $notif_stmt->bindParam(':notif_message', $notif_message);
            $notif_stmt->bindParam(':exchange_id', $data->exchange_id);
            $notif_stmt->execute();
        }
        
        Logger::info("Exchange updated", [
            'exchange_id' => $data->exchange_id,
            'user_id' => $user_id,
            'updated_fields' => array_keys($params)
        ]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Exchange updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update exchange');
    }

} catch (Exception $e) {
    Logger::error('update_exchange.php exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error. Please try again later.'
    ]);
}
?>
