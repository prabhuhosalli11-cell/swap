<?php
/**
 * Get Skills API
 * Fetches all user skills with user information
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get database connection
    $database = new Database();
    $conn = $database->getConnection();

    // Get optional filters from query params
    $category = isset($_GET['category']) ? $_GET['category'] : 'All';
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    // Build query to get users offering skills
    $query = "SELECT 
                u.user_id,
                u.full_name,
                u.email,
                u.profile_picture,
                u.rating,
                u.total_exchanges,
                u.bio,
                u.location,
                offering_skill.skill_id as offering_skill_id,
                offering_skill.skill_name as offering_skill,
                seeking_skill.skill_name as seeking_skill,
                offering_us.proficiency_level,
                offering_us.description as skill_description,
                sc.category_name as category
              FROM users u
              INNER JOIN user_skills offering_us ON u.user_id = offering_us.user_id AND offering_us.skill_type = 'offering'
              INNER JOIN skills offering_skill ON offering_us.skill_id = offering_skill.skill_id
              INNER JOIN skill_categories sc ON offering_skill.category_id = sc.category_id
              LEFT JOIN user_skills seeking_us ON u.user_id = seeking_us.user_id AND seeking_us.skill_type = 'seeking'
              LEFT JOIN skills seeking_skill ON seeking_us.skill_id = seeking_skill.skill_id
              WHERE u.account_status = 'active' AND offering_us.is_active = TRUE";

    // Add category filter
    if ($category !== 'All' && !empty($category)) {
        $query .= " AND sc.category_name = :category";
    }

    // Add search filter
    if (!empty($search)) {
        $query .= " AND (u.full_name LIKE :search 
                     OR offering_skill.skill_name LIKE :search 
                     OR seeking_skill.skill_name LIKE :search
                     OR u.bio LIKE :search)";
    }

    $query .= " ORDER BY u.rating DESC, u.total_exchanges DESC";

    $stmt = $conn->prepare($query);

    // Bind parameters
    if ($category !== 'All' && !empty($category)) {
        $stmt->bindParam(':category', $category);
    }
    if (!empty($search)) {
        $searchParam = "%{$search}%";
        $stmt->bindParam(':search', $searchParam);
    }

    $stmt->execute();

    // Fetch all results
    $skills = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Generate avatar emoji based on user_id
        $avatars = ['👨‍💻', '👩‍🎨', '🧑‍🎓', '👨‍🏫', '👩‍💼', '🧑‍🔬', '👨‍🎤', '👩‍🍳'];
        $avatar = $avatars[$row['user_id'] % count($avatars)];

        $skills[] = [
            'user_id' => (int)$row['user_id'],
            'user' => $row['full_name'],
            'avatar' => $avatar,
            'offering' => $row['offering_skill'],
            'seeking' => $row['seeking_skill'] ?: 'Open to various skills',
            'level' => ucfirst($row['proficiency_level'] ?: 'intermediate'),
            'category' => $row['category_name'] ?? $row['category'] ?? 'General',
            'description' => $row['skill_description'] ?: $row['bio'] ?: 'Passionate about sharing knowledge',
            'rating' => (float)$row['rating'],
            'exchanges' => (int)$row['total_exchanges'],
            'location' => $row['location']
        ];
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'count' => count($skills),
        'skills' => $skills
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
