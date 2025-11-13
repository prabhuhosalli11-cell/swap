<?php
/**
 * Get All Skills List API
 * Returns all available skills with their categories for dropdown/selection
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

try {
    $database = new Database();
    $conn = $database->getConnection();

    $query = "SELECT 
                s.skill_id,
                s.skill_name,
                s.description as skill_description,
                sc.category_id,
                sc.category_name,
                sc.icon
              FROM skills s
              JOIN skill_categories sc ON s.category_id = sc.category_id
              ORDER BY sc.category_name, s.skill_name";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group by category
    $grouped = [];
    foreach ($skills as $skill) {
        $category = $skill['category_name'];
        if (!isset($grouped[$category])) {
            $grouped[$category] = [
                'category_id' => $skill['category_id'],
                'category_name' => $category,
                'icon' => $skill['icon'],
                'skills' => []
            ];
        }
        $grouped[$category]['skills'][] = [
            'skill_id' => $skill['skill_id'],
            'skill_name' => $skill['skill_name'],
            'description' => $skill['skill_description']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'skills' => $skills,
        'grouped' => array_values($grouped),
        'count' => count($skills)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}
?>
