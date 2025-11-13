<?php
/**
 * Get Connections API
 * Retrieves all connection/exchange requests for the authenticated user
 * Shows both incoming and outgoing connections with full details
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

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Get all exchanges where user is either requester or provider
    $query = "SELECT 
                e.exchange_id,
                e.requester_id,
                e.provider_id,
                e.status,
                e.message,
                e.meeting_preference,
                e.created_at,
                e.updated_at,
                e.start_date,
                e.end_date,
                
                -- Requester details
                u_req.full_name AS requester_name,
                u_req.email AS requester_email,
                u_req.rating AS requester_rating,
                LEFT(u_req.full_name, 1) AS requester_avatar,
                
                -- Provider details
                u_prov.full_name AS provider_name,
                u_prov.email AS provider_email,
                u_prov.rating AS provider_rating,
                LEFT(u_prov.full_name, 1) AS provider_avatar,
                
                -- Skill details
                s_req.skill_name AS requested_skill_name,
                s_req.skill_id AS requested_skill_id,
                sc_req.category_name AS requested_skill_category,
                
                s_off.skill_name AS offered_skill_name,
                s_off.skill_id AS offered_skill_id,
                sc_off.category_name AS offered_skill_category
                
            FROM exchanges e
            
            -- Join requester details
            INNER JOIN users u_req ON e.requester_id = u_req.user_id
            
            -- Join provider details
            INNER JOIN users u_prov ON e.provider_id = u_prov.user_id
            
            -- Join requested skill details
            INNER JOIN skills s_req ON e.requested_skill_id = s_req.skill_id
            LEFT JOIN skill_categories sc_req ON s_req.category_id = sc_req.category_id
            
            -- Join offered skill details (optional)
            LEFT JOIN skills s_off ON e.offered_skill_id = s_off.skill_id
            LEFT JOIN skill_categories sc_off ON s_off.category_id = sc_off.category_id
            
            WHERE e.requester_id = :user_id1 OR e.provider_id = :user_id2
            
            ORDER BY 
                CASE 
                    WHEN e.status = 'pending' THEN 1
                    WHEN e.status = 'accepted' THEN 2
                    WHEN e.status = 'in_progress' THEN 3
                    WHEN e.status = 'completed' THEN 4
                    ELSE 5
                END,
                e.created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id1', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':user_id2', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $connections = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Determine if current user is requester or provider
        $is_requester = ($row['requester_id'] == $user_id);
        
        // Format connection data
        $connection = [
            'exchange_id' => (int)$row['exchange_id'],
            'status' => $row['status'],
            'message' => $row['message'],
            'meeting_preference' => $row['meeting_preference'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'start_date' => $row['start_date'],
            'end_date' => $row['end_date'],
            
            // User role information
            'is_requester' => $is_requester,
            'role' => $is_requester ? 'requester' : 'provider',
            
            // Requester information
            'requester_id' => (int)$row['requester_id'],
            'requester_name' => $row['requester_name'],
            'requester_email' => $row['requester_email'],
            'requester_rating' => (float)$row['requester_rating'],
            'requester_avatar' => $row['requester_avatar'],
            
            // Provider information
            'provider_id' => (int)$row['provider_id'],
            'provider_name' => $row['provider_name'],
            'provider_email' => $row['provider_email'],
            'provider_rating' => (float)$row['provider_rating'],
            'provider_avatar' => $row['provider_avatar'],
            
            // Skill information
            'requested_skill_id' => (int)$row['requested_skill_id'],
            'requested_skill_name' => $row['requested_skill_name'],
            'requested_skill_category' => $row['requested_skill_category'],
            
            'offered_skill_id' => $row['offered_skill_id'] ? (int)$row['offered_skill_id'] : null,
            'offered_skill_name' => $row['offered_skill_name'],
            'offered_skill_category' => $row['offered_skill_category']
        ];
        
        $connections[] = $connection;
    }
    
    Logger::info("Connections retrieved", [
        'user_id' => $user_id,
        'count' => count($connections)
    ]);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'connections' => $connections,
        'total_count' => count($connections)
    ]);

} catch (Exception $e) {
    Logger::error('get_connections.php exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error. Please try again later.'
    ]);
}
?>
