<?php
/**
 * Database Configuration File
 * Update these credentials according to your MySQL setup
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/logger.php';

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = DB_HOST;
        $this->db_name = DB_NAME;
        $this->username = DB_USER;
        $this->password = DB_PASS;
    }

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=" . DB_CHARSET;
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch(PDOException $exception) {
            Logger::critical('Database connection failed: ' . $exception->getMessage());
            
            // Don't expose database errors to clients in production
            http_response_code(503);
            echo json_encode([
                'success' => false,
                'message' => APP_DEBUG ? 
                    'Database connection error: ' . $exception->getMessage() : 
                    'Service temporarily unavailable. Please try again later.'
            ]);
            exit;
        }

        return $this->conn;
    }
}
?>
