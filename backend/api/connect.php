<?php
/**
 * Connection Request API
 * Creates an exchange request to connect with another user
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

$requester_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (!isset($data->provider_id) || !isset($data->requested_skill_id)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Provider and skill are required'
    ]);
    exit;
}

// Convert empty values to proper types
$provider_id = (int)$data->provider_id;
$requested_skill_id = (int)$data->requested_skill_id;

if ($provider_id <= 0 || $requested_skill_id <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid provider or skill ID'
    ]);
    exit;
}

// Self-connection allowed for testing/college project demo purposes
// Commented out restriction:
// if ($requester_id == $data->provider_id) {
//     http_response_code(400);
//     echo json_encode([
//         'success' => false,
//         'message' => 'You cannot connect with yourself'
//     ]);
//     exit;
// }

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Check if connection already exists (pending or active)
    $check_query = "SELECT exchange_id, status FROM exchanges 
                    WHERE ((requester_id = ? AND provider_id = ?)
                    OR (requester_id = ? AND provider_id = ?))
                    AND status IN ('pending', 'accepted', 'in_progress')
                    LIMIT 1";
    
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->execute([$requester_id, $data->provider_id, $data->provider_id, $requester_id]);
    
    if ($check_stmt->rowCount() > 0) {
        $existing = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Connection already exists - just return success so they can chat
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Connection already exists. Opening chat...',
            'exchange_id' => $existing['exchange_id'],
            'already_connected' => true
        ]);
        exit;
    }

    // Create new exchange request
    $insert_query = "INSERT INTO exchanges 
                     (requester_id, provider_id, requested_skill_id, offered_skill_id, 
                      status, message, meeting_preference) 
                     VALUES 
                     (:requester_id, :provider_id, :requested_skill_id, :offered_skill_id, 
                      'pending', :message, :meeting_preference)";
    
    $stmt = $conn->prepare($insert_query);
    $stmt->bindParam(':requester_id', $requester_id, PDO::PARAM_INT);
    $stmt->bindParam(':provider_id', $provider_id, PDO::PARAM_INT);
    $stmt->bindParam(':requested_skill_id', $requested_skill_id, PDO::PARAM_INT);
    
    // Handle optional fields with proper defaults
    $offered_skill = isset($data->offered_skill_id) && !empty($data->offered_skill_id) ? (int)$data->offered_skill_id : null;
    $message = isset($data->message) && trim($data->message) !== '' ? trim($data->message) : '';
    $meeting_pref = isset($data->meeting_preference) && !empty($data->meeting_preference) ? $data->meeting_preference : 'online';
    
    if ($offered_skill !== null) {
        $stmt->bindParam(':offered_skill_id', $offered_skill, PDO::PARAM_INT);
    } else {
        $stmt->bindValue(':offered_skill_id', null, PDO::PARAM_NULL);
    }
    $stmt->bindParam(':message', $message, PDO::PARAM_STR);
    $stmt->bindParam(':meeting_preference', $meeting_pref, PDO::PARAM_STR);
    
    if ($stmt->execute()) {
        $exchange_id = $conn->lastInsertId();
        
        // Create notification for provider
        $notif_query = "INSERT INTO notifications 
                        (user_id, type, title, message, related_id) 
                        VALUES 
                        (:user_id, 'exchange_request', :title, :notif_message, :exchange_id)";
        
        $notif_stmt = $conn->prepare($notif_query);
        $notif_stmt->bindParam(':user_id', $data->provider_id);
        
        // Get requester name
        $name_query = "SELECT full_name FROM users WHERE user_id = :user_id";
        $name_stmt = $conn->prepare($name_query);
        $name_stmt->bindParam(':user_id', $requester_id);
        $name_stmt->execute();
        $requester = $name_stmt->fetch(PDO::FETCH_ASSOC);
        
        $title = 'New Connection Request';
        $notif_message = $requester['full_name'] . ' wants to connect with you!';
        
        $notif_stmt->bindParam(':title', $title);
        $notif_stmt->bindParam(':notif_message', $notif_message);
        $notif_stmt->bindParam(':exchange_id', $exchange_id);
        $notif_stmt->execute();
        
        // Create first message to start the conversation (only if message is not empty)
        if (!empty($message) && trim($message) !== '') {
            $msg_query = "INSERT INTO messages 
                          (sender_id, receiver_id, message_text, is_read) 
                          VALUES 
                          (:sender_id, :receiver_id, :message_text, 0)";
            
            $msg_stmt = $conn->prepare($msg_query);
            $msg_stmt->bindParam(':sender_id', $requester_id, PDO::PARAM_INT);
            $msg_stmt->bindParam(':receiver_id', $provider_id, PDO::PARAM_INT);
            $msg_stmt->bindParam(':message_text', $message, PDO::PARAM_STR);
            $msg_stmt->execute();
            
            Logger::info("First message created for conversation", [
                'sender_id' => $requester_id,
                'receiver_id' => $provider_id,
                'message_id' => $conn->lastInsertId()
            ]);
        }
        
        Logger::info("Connection request created", [
            'requester_id' => $requester_id,
            'provider_id' => $provider_id,
            'exchange_id' => $exchange_id
        ]);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Connection request sent successfully!',
            'exchange_id' => $exchange_id,
            'conversation_started' => true
        ]);
    } else {
        throw new Exception('Failed to create connection request');
    }

} catch (Exception $e) {
    Logger::error('connect.php exception: ' . $e->getMessage(), [
        'trace' => $e->getTraceAsString(),
        'requester_id' => $requester_id ?? 'unknown',
        'provider_id' => $provider_id ?? 'unknown',
        'requested_skill_id' => $requested_skill_id ?? 'unknown'
    ]);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => APP_DEBUG ? $e->getMessage() : 'Server error. Please try again later.'
    ]);
}
?>
