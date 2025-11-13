<?php
/**
 * Get Conversations API
 * Returns all message conversations for the current user
 */

require_once '../config/cors.php';
require_once '../config/database.php';

session_start();

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Get all users the current user has exchanged messages with
    $query = "SELECT 
                other_user_id,
                full_name,
                profile_picture,
                rating,
                last_message,
                last_message_time,
                unread_count
              FROM (
                SELECT DISTINCT
                    CASE 
                        WHEN m.sender_id = ? THEN m.receiver_id
                        ELSE m.sender_id
                    END as other_user_id,
                    u.full_name,
                    u.profile_picture,
                    u.rating,
                    '' as last_message,
                    m.created_at as last_message_time,
                    0 as unread_count
                FROM messages m
                JOIN users u ON (CASE 
                        WHEN m.sender_id = ? THEN m.receiver_id
                        ELSE m.sender_id
                    END) = u.user_id
                WHERE m.sender_id = ? OR m.receiver_id = ?
              ) as base
              ORDER BY last_message_time DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$user_id, $user_id, $user_id, $user_id]);
    
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get last message and unread count for each conversation
    foreach ($conversations as &$conv) {
        // Get last message
        $msg_query = "SELECT message_text, created_at FROM messages 
                     WHERE (sender_id = ? AND receiver_id = ?)
                     OR (sender_id = ? AND receiver_id = ?)
                     ORDER BY created_at DESC LIMIT 1";
        $msg_stmt = $conn->prepare($msg_query);
        $msg_stmt->execute([$user_id, $conv['other_user_id'], $conv['other_user_id'], $user_id]);
        $last_msg = $msg_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($last_msg) {
            $conv['last_message'] = $last_msg['message_text'];
            $conv['last_message_time'] = $last_msg['created_at'];
        }
        
        // Get unread count
        $unread_query = "SELECT COUNT(*) as count FROM messages 
                        WHERE sender_id = ? AND receiver_id = ? AND is_read = 0";
        $unread_stmt = $conn->prepare($unread_query);
        $unread_stmt->execute([$conv['other_user_id'], $user_id]);
        $unread = $unread_stmt->fetch(PDO::FETCH_ASSOC);
        $conv['unread_count'] = (int)$unread['count'];
    }
    
    // Format conversations
    foreach ($conversations as &$conv) {
        $conv['other_user_id'] = (int)$conv['other_user_id'];
        $conv['unread_count'] = (int)$conv['unread_count'];
        $conv['rating'] = (float)$conv['rating'];
        
        // Generate avatar if no profile picture
        if (empty($conv['profile_picture'])) {
            $avatars = ['👨‍💻', '👩‍🎨', '🧑‍🎓', '👨‍🏫', '👩‍💼', '🧑‍🔬', '👨‍🎤', '👩‍🍳'];
            $conv['avatar'] = $avatars[$conv['other_user_id'] % count($avatars)];
        } else {
            $conv['avatar'] = $conv['profile_picture'];
        }
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'conversations' => $conversations,
        'count' => count($conversations)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}
?>
