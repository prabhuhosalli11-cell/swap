<?php
/**
 * User Skills CRUD API
 * Handles Create, Read, Update, Delete operations for user skills
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

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $conn = $database->getConnection();

    switch ($method) {
        case 'GET':
            // Read - Get all user skills
            getUserSkills($conn, $user_id);
            break;

        case 'POST':
            // Create - Add new skill
            $data = json_decode(file_get_contents("php://input"));
            createUserSkill($conn, $user_id, $data);
            break;

        case 'PUT':
            // Update - Modify existing skill
            $data = json_decode(file_get_contents("php://input"));
            updateUserSkill($conn, $user_id, $data);
            break;

        case 'DELETE':
            // Delete - Remove skill
            $data = json_decode(file_get_contents("php://input"));
            deleteUserSkill($conn, $user_id, $data);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }

} catch (Exception $e) {
    Logger::error('user_skills_crud.php exception: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error. Please try again later.'
    ]);
}

// GET - Read all user skills
function getUserSkills($conn, $user_id) {
    $query = "SELECT 
                us.user_skill_id,
                us.skill_id,
                us.skill_type,
                us.proficiency_level,
                us.description,
                us.years_experience,
                us.is_active,
                us.created_at,
                s.skill_name,
                sc.category_id,
                sc.category_name,
                sc.icon
              FROM user_skills us
              JOIN skills s ON us.skill_id = s.skill_id
              JOIN skill_categories sc ON s.category_id = sc.category_id
              WHERE us.user_id = :user_id
              ORDER BY us.created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'skills' => $skills,
        'count' => count($skills)
    ]);
}

// POST - Create new user skill
function createUserSkill($conn, $user_id, $data) {
    // Validate required fields
    if (empty($data->skill_id) || empty($data->skill_type)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Skill and type are required'
        ]);
        return;
    }

    // Check if skill already exists for this user with this type
    $check_query = "SELECT user_skill_id FROM user_skills 
                    WHERE user_id = :user_id 
                    AND skill_id = :skill_id 
                    AND skill_type = :skill_type";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bindParam(':user_id', $user_id);
    $check_stmt->bindParam(':skill_id', $data->skill_id);
    $check_stmt->bindParam(':skill_type', $data->skill_type);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'You already have this skill in your ' . $data->skill_type . ' list'
        ]);
        return;
    }

    // Insert new skill
    $query = "INSERT INTO user_skills 
              (user_id, skill_id, skill_type, proficiency_level, description, years_experience) 
              VALUES (:user_id, :skill_id, :skill_type, :proficiency_level, :description, :years_experience)";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':skill_id', $data->skill_id);
    $stmt->bindParam(':skill_type', $data->skill_type);
    
    $proficiency = $data->proficiency_level ?? null;
    $description = $data->description ?? null;
    $years = $data->years_experience ?? 0;
    
    $stmt->bindParam(':proficiency_level', $proficiency);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':years_experience', $years);
    
    if ($stmt->execute()) {
        $new_id = $conn->lastInsertId();
        
        Logger::info("User skill created", [
            'user_id' => $user_id,
            'skill_id' => $data->skill_id,
            'type' => $data->skill_type
        ]);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Skill added successfully',
            'user_skill_id' => $new_id
        ]);
    } else {
        throw new Exception('Failed to insert skill');
    }
}

// PUT - Update user skill
function updateUserSkill($conn, $user_id, $data) {
    if (empty($data->user_skill_id)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Skill ID is required'
        ]);
        return;
    }

    // Verify ownership
    $check_query = "SELECT user_skill_id FROM user_skills 
                    WHERE user_skill_id = :user_skill_id AND user_id = :user_id";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bindParam(':user_skill_id', $data->user_skill_id);
    $check_stmt->bindParam(':user_id', $user_id);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Skill not found'
        ]);
        return;
    }

    // Build update query
    $updates = [];
    $params = [':user_skill_id' => $data->user_skill_id];
    
    if (isset($data->proficiency_level)) {
        $updates[] = "proficiency_level = :proficiency_level";
        $params[':proficiency_level'] = $data->proficiency_level;
    }
    
    if (isset($data->description)) {
        $updates[] = "description = :description";
        $params[':description'] = $data->description;
    }
    
    if (isset($data->years_experience)) {
        $updates[] = "years_experience = :years_experience";
        $params[':years_experience'] = $data->years_experience;
    }
    
    if (isset($data->is_active)) {
        $updates[] = "is_active = :is_active";
        $params[':is_active'] = $data->is_active ? 1 : 0;
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No fields to update'
        ]);
        return;
    }

    $query = "UPDATE user_skills SET " . implode(', ', $updates) . " 
              WHERE user_skill_id = :user_skill_id";
    
    $stmt = $conn->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    if ($stmt->execute()) {
        Logger::info("User skill updated", [
            'user_id' => $user_id,
            'user_skill_id' => $data->user_skill_id
        ]);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Skill updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update skill');
    }
}

// DELETE - Remove user skill
function deleteUserSkill($conn, $user_id, $data) {
    if (empty($data->user_skill_id)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Skill ID is required'
        ]);
        return;
    }

    // Verify ownership and delete
    $query = "DELETE FROM user_skills 
              WHERE user_skill_id = :user_skill_id AND user_id = :user_id";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':user_skill_id', $data->user_skill_id);
    $stmt->bindParam(':user_id', $user_id);
    
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            Logger::info("User skill deleted", [
                'user_id' => $user_id,
                'user_skill_id' => $data->user_skill_id
            ]);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Skill deleted successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Skill not found'
            ]);
        }
    } else {
        throw new Exception('Failed to delete skill');
    }
}
?>
