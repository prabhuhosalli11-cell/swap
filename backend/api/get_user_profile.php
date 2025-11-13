<?php
/**
 * Get User Profile API
 * Returns detailed profile information for a specific user
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

// Get user_id from query parameter
$profile_user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

if (!$profile_user_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'User ID is required']);
    exit;
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Get basic user information
    $user_query = "SELECT 
                    user_id,
                    full_name,
                    email,
                    bio,
                    profile_picture,
                    rating,
                    total_exchanges,
                    created_at,
                    is_active
                   FROM users 
                   WHERE user_id = ?";
    
    $user_stmt = $conn->prepare($user_query);
    $user_stmt->execute([$profile_user_id]);
    $user = $user_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    // Generate avatar if no profile picture
    if (empty($user['profile_picture'])) {
        $avatars = ['👨‍💻', '👩‍🎨', '🧑‍🎓', '👨‍🏫', '👩‍💼', '🧑‍🔬', '👨‍🎤', '👩‍🍳'];
        $user['avatar'] = $avatars[$user['user_id'] % count($avatars)];
    } else {
        $user['avatar'] = $user['profile_picture'];
    }

    // Get skills offered by this user
    $skills_query = "SELECT 
                        s.skill_id,
                        s.skill_name,
                        s.category,
                        us.proficiency_level,
                        us.years_experience
                     FROM user_skills us
                     JOIN skills s ON us.skill_id = s.skill_id
                     WHERE us.user_id = ? AND us.skill_type = 'offering'
                     ORDER BY us.proficiency_level DESC, s.skill_name ASC";
    
    $skills_stmt = $conn->prepare($skills_query);
    $skills_stmt->execute([$profile_user_id]);
    $offered_skills = $skills_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get skills user wants to learn
    $learning_query = "SELECT 
                        s.skill_id,
                        s.skill_name,
                        s.category
                       FROM user_skills us
                       JOIN skills s ON us.skill_id = s.skill_id
                       WHERE us.user_id = ? AND us.skill_type = 'seeking'
                       ORDER BY s.skill_name ASC";
    
    $learning_stmt = $conn->prepare($learning_query);
    $learning_stmt->execute([$profile_user_id]);
    $learning_skills = $learning_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format response
    $user['user_id'] = (int)$user['user_id'];
    $user['rating'] = (float)$user['rating'];
    $user['total_exchanges'] = (int)$user['total_exchanges'];
    $user['is_active'] = (bool)$user['is_active'];
    $user['member_since'] = $user['created_at'];
    $user['offered_skills'] = $offered_skills;
    $user['learning_skills'] = $learning_skills;

    // Remove sensitive data
    unset($user['email']);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);

} catch (Exception $e) {
    error_log("get_user_profile.php error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}
?>
