<?php
/**
 * Messages CRUD API
 * Handles sending, receiving, and managing messages
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../config/logger.php';

session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $conn = $database->getConnection();

    switch ($method) {
        case 'GET':
            // Get messages with a specific user
            $other_user_id = $_GET['user_id'] ?? null;
            if (!$other_user_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'User ID required']);
                exit;
            }
            getMessages($conn, $user_id, $other_user_id);
            break;

        case 'POST':
            // Send a new message
            $data = json_decode(file_get_contents("php://input"));
            sendMessage($conn, $user_id, $data);
            break;

        case 'PUT':
            // Mark messages as read
            $data = json_decode(file_get_contents("php://input"));
            markAsRead($conn, $user_id, $data);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }

} catch (Exception $e) {
    Logger::error('messages_crud.php exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}

// Get messages between current user and another user
function getMessages($conn, $user_id, $other_user_id) {
    $query = "SELECT 
                m.message_id,
                m.sender_id,
                m.receiver_id,
                m.message_text,
                m.is_read,
                m.created_at,
                m.exchange_id,
                u.full_name as sender_name,
                u.profile_picture as sender_avatar
              FROM messages m
              JOIN users u ON m.sender_id = u.user_id
              WHERE (m.sender_id = ? AND m.receiver_id = ?)
              OR (m.sender_id = ? AND m.receiver_id = ?)
              ORDER BY m.created_at ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$user_id, $other_user_id, $other_user_id, $user_id]);
    
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format messages
    foreach ($messages as &$msg) {
        $msg['message_id'] = (int)$msg['message_id'];
        $msg['sender_id'] = (int)$msg['sender_id'];
        $msg['receiver_id'] = (int)$msg['receiver_id'];
        $msg['is_read'] = (bool)$msg['is_read'];
        $msg['is_own'] = ($msg['sender_id'] == $user_id);
        
        // Generate avatar if no profile picture
        if (empty($msg['sender_avatar'])) {
            $avatars = ['👨‍💻', '👩‍🎨', '🧑‍🎓', '👨‍🏫', '👩‍💼', '🧑‍🔬', '👨‍🎤', '👩‍🍳'];
            $msg['sender_avatar'] = $avatars[$msg['sender_id'] % count($avatars)];
        }
    }
    
    // Get other user info
    $user_query = "SELECT user_id, full_name, profile_picture, rating 
                   FROM users WHERE user_id = ?";
    $user_stmt = $conn->prepare($user_query);
    $user_stmt->execute([$other_user_id]);
    $other_user = $user_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($other_user && empty($other_user['profile_picture'])) {
        $avatars = ['👨‍💻', '👩‍🎨', '🧑‍🎓', '👨‍🏫', '👩‍💼', '🧑‍🔬', '👨‍🎤', '👩‍🍳'];
        $other_user['avatar'] = $avatars[$other_user_id % count($avatars)];
    } else {
        $other_user['avatar'] = $other_user['profile_picture'] ?? '👤';
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'messages' => $messages,
        'other_user' => $other_user,
        'count' => count($messages)
    ]);
}

// Send a new message
function sendMessage($conn, $sender_id, $data) {
    if (empty($data->receiver_id) || empty($data->message_text)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Receiver and message text are required'
        ]);
        return;
    }

    // Can't send message to yourself
    if ($sender_id == $data->receiver_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Cannot send message to yourself'
        ]);
        return;
    }

    $query = "INSERT INTO messages 
              (sender_id, receiver_id, exchange_id, message_text) 
              VALUES 
              (:sender_id, :receiver_id, :exchange_id, :message_text)";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':sender_id', $sender_id);
    $stmt->bindParam(':receiver_id', $data->receiver_id);
    
    $exchange_id = $data->exchange_id ?? null;
    $stmt->bindParam(':exchange_id', $exchange_id);
    $stmt->bindParam(':message_text', $data->message_text);
    
    if ($stmt->execute()) {
        $message_id = $conn->lastInsertId();
        
        // Create notification for receiver
        $notif_query = "INSERT INTO notifications 
                        (user_id, type, title, message, related_id) 
                        VALUES 
                        (:user_id, 'new_message', :title, :notif_message, :message_id)";
        
        $notif_stmt = $conn->prepare($notif_query);
        $notif_stmt->bindParam(':user_id', $data->receiver_id);
        
        // Get sender name
        $name_query = "SELECT full_name FROM users WHERE user_id = :user_id";
        $name_stmt = $conn->prepare($name_query);
        $name_stmt->bindParam(':user_id', $sender_id);
        $name_stmt->execute();
        $sender = $name_stmt->fetch(PDO::FETCH_ASSOC);
        
        $title = 'New Message';
        $notif_message = $sender['full_name'] . ': ' . substr($data->message_text, 0, 50);
        
        $notif_stmt->bindParam(':title', $title);
        $notif_stmt->bindParam(':notif_message', $notif_message);
        $notif_stmt->bindParam(':message_id', $message_id);
        $notif_stmt->execute();
        
        Logger::info("Message sent", [
            'sender_id' => $sender_id,
            'receiver_id' => $data->receiver_id,
            'message_id' => $message_id
        ]);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Message sent successfully',
            'message_id' => $message_id
        ]);
    } else {
        throw new Exception('Failed to send message');
    }
}

// Mark messages as read
function markAsRead($conn, $user_id, $data) {
    if (empty($data->sender_id)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Sender ID required'
        ]);
        return;
    }

    $query = "UPDATE messages 
              SET is_read = 1 
              WHERE sender_id = :sender_id 
              AND receiver_id = :receiver_id 
              AND is_read = 0";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':sender_id', $data->sender_id);
    $stmt->bindParam(':receiver_id', $user_id);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Messages marked as read',
            'updated_count' => $stmt->rowCount()
        ]);
    } else {
        throw new Exception('Failed to mark messages as read');
    }
}
?>
