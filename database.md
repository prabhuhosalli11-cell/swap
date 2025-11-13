# SkillXchange Database Schema

## Database Overview
This document outlines the database structure for the SkillXchange platform - a skill exchange application where users can offer skills they have and find people to learn skills from.

---

## Tables and Attributes

### 1. **users**
Stores user account information and profile details.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| user_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each user |
| full_name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address for login |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password for security |
| profile_picture | VARCHAR(255) | NULL | URL or path to profile picture |
| bio | TEXT | NULL | User's biography/description |
| location | VARCHAR(100) | NULL | User's city/country |
| phone | VARCHAR(20) | NULL | Contact phone number |
| rating | DECIMAL(3,2) | DEFAULT 0.0 | Average rating from exchanges (0.0-5.0) |
| total_exchanges | INT | DEFAULT 0 | Total number of completed exchanges |
| account_status | ENUM('active', 'inactive', 'suspended') | DEFAULT 'active' | Account status |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (user_id)
- UNIQUE INDEX (email)
- INDEX (account_status)

---

### 2. **skills**
Master table for all available skills in the platform.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| skill_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each skill |
| skill_name | VARCHAR(100) | UNIQUE, NOT NULL | Name of the skill |
| category_id | INT | FOREIGN KEY | Reference to skill_categories table |
| description | TEXT | NULL | Detailed description of the skill |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Skill addition date |

**Indexes:**
- PRIMARY KEY (skill_id)
- UNIQUE INDEX (skill_name)
- FOREIGN KEY (category_id) REFERENCES skill_categories(category_id)

---

### 3. **skill_categories**
Categories to organize skills.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| category_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for category |
| category_name | VARCHAR(50) | UNIQUE, NOT NULL | Category name (e.g., Programming, Design) |
| icon | VARCHAR(10) | NULL | Emoji or icon representation |
| description | TEXT | NULL | Category description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Category creation date |

**Indexes:**
- PRIMARY KEY (category_id)
- UNIQUE INDEX (category_name)

**Default Categories:**
- Programming
- Design
- Music
- Languages
- Business
- Photography
- Writing
- Sports

---

### 4. **user_skills**
Junction table linking users to skills they offer or seek.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| user_skill_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_id | INT | FOREIGN KEY, NOT NULL | Reference to users table |
| skill_id | INT | FOREIGN KEY, NOT NULL | Reference to skills table |
| skill_type | ENUM('offering', 'seeking') | NOT NULL | Whether user offers or seeks this skill |
| proficiency_level | ENUM('beginner', 'intermediate', 'advanced', 'expert') | NULL | Skill level (for offerings) |
| description | TEXT | NULL | Additional details about skill |
| years_experience | INT | NULL | Years of experience (for offerings) |
| is_active | BOOLEAN | DEFAULT TRUE | Whether skill is actively listed |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |

**Indexes:**
- PRIMARY KEY (user_skill_id)
- FOREIGN KEY (user_id) REFERENCES users(user_id)
- FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
- INDEX (skill_type)
- UNIQUE INDEX (user_id, skill_id, skill_type)

---

### 5. **exchanges**
Tracks skill exchange requests and their status.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| exchange_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for exchange |
| requester_id | INT | FOREIGN KEY, NOT NULL | User initiating the exchange |
| provider_id | INT | FOREIGN KEY, NOT NULL | User receiving the request |
| requested_skill_id | INT | FOREIGN KEY, NOT NULL | Skill being requested |
| offered_skill_id | INT | FOREIGN KEY, NULL | Skill being offered in return |
| status | ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled') | DEFAULT 'pending' | Exchange status |
| message | TEXT | NULL | Initial message from requester |
| start_date | DATE | NULL | Planned start date |
| end_date | DATE | NULL | Planned end date |
| meeting_preference | ENUM('online', 'in_person', 'hybrid') | NULL | Preferred meeting method |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Request creation date |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last status update |
| completed_at | TIMESTAMP | NULL | Completion timestamp |

**Indexes:**
- PRIMARY KEY (exchange_id)
- FOREIGN KEY (requester_id) REFERENCES users(user_id)
- FOREIGN KEY (provider_id) REFERENCES users(user_id)
- FOREIGN KEY (requested_skill_id) REFERENCES skills(skill_id)
- FOREIGN KEY (offered_skill_id) REFERENCES skills(skill_id)
- INDEX (status)
- INDEX (requester_id, status)
- INDEX (provider_id, status)

---

### 6. **reviews**
User reviews and ratings after exchanges.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| review_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for review |
| exchange_id | INT | FOREIGN KEY, NOT NULL | Reference to exchange |
| reviewer_id | INT | FOREIGN KEY, NOT NULL | User giving the review |
| reviewee_id | INT | FOREIGN KEY, NOT NULL | User being reviewed |
| rating | INT | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Rating from 1 to 5 |
| comment | TEXT | NULL | Written review |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Review creation date |

**Indexes:**
- PRIMARY KEY (review_id)
- FOREIGN KEY (exchange_id) REFERENCES exchanges(exchange_id)
- FOREIGN KEY (reviewer_id) REFERENCES users(user_id)
- FOREIGN KEY (reviewee_id) REFERENCES users(user_id)
- UNIQUE INDEX (exchange_id, reviewer_id)
- INDEX (reviewee_id)

---

### 7. **messages**
Direct messages between users.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| message_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for message |
| sender_id | INT | FOREIGN KEY, NOT NULL | User sending the message |
| receiver_id | INT | FOREIGN KEY, NOT NULL | User receiving the message |
| exchange_id | INT | FOREIGN KEY, NULL | Related exchange (if applicable) |
| message_text | TEXT | NOT NULL | Message content |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Message sent time |

**Indexes:**
- PRIMARY KEY (message_id)
- FOREIGN KEY (sender_id) REFERENCES users(user_id)
- FOREIGN KEY (receiver_id) REFERENCES users(user_id)
- FOREIGN KEY (exchange_id) REFERENCES exchanges(exchange_id)
- INDEX (receiver_id, is_read)
- INDEX (sender_id, receiver_id)

---

### 8. **notifications**
System notifications for users.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| notification_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_id | INT | FOREIGN KEY, NOT NULL | User receiving notification |
| type | ENUM('exchange_request', 'exchange_accepted', 'exchange_completed', 'new_message', 'review_received', 'system') | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| related_id | INT | NULL | ID of related entity (exchange_id, message_id, etc.) |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Notification creation time |

**Indexes:**
- PRIMARY KEY (notification_id)
- FOREIGN KEY (user_id) REFERENCES users(user_id)
- INDEX (user_id, is_read)
- INDEX (created_at)

---

### 9. **favorites**
Users can favorite other users for quick access.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| favorite_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_id | INT | FOREIGN KEY, NOT NULL | User who favorited |
| favorited_user_id | INT | FOREIGN KEY, NOT NULL | User being favorited |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Favorite added date |

**Indexes:**
- PRIMARY KEY (favorite_id)
- FOREIGN KEY (user_id) REFERENCES users(user_id)
- FOREIGN KEY (favorited_user_id) REFERENCES users(user_id)
- UNIQUE INDEX (user_id, favorited_user_id)

---

### 10. **sessions**
Track user login sessions (optional, for security).

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| session_id | VARCHAR(255) | PRIMARY KEY | Unique session identifier |
| user_id | INT | FOREIGN KEY, NOT NULL | Reference to user |
| ip_address | VARCHAR(45) | NULL | User's IP address |
| user_agent | VARCHAR(255) | NULL | Browser/device info |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Session start time |
| expires_at | TIMESTAMP | NOT NULL | Session expiration time |

**Indexes:**
- PRIMARY KEY (session_id)
- FOREIGN KEY (user_id) REFERENCES users(user_id)
- INDEX (expires_at)

---

## Relationships Summary

### One-to-Many Relationships:
1. **users → user_skills** (One user has many skills)
2. **users → exchanges** (One user initiates/receives many exchanges)
3. **users → reviews** (One user gives/receives many reviews)
4. **users → messages** (One user sends/receives many messages)
5. **users → notifications** (One user has many notifications)
6. **skill_categories → skills** (One category has many skills)
7. **exchanges → reviews** (One exchange can have multiple reviews)

### Many-to-Many Relationships:
1. **users ↔ skills** (through user_skills junction table)
2. **users ↔ users** (through exchanges table for skill exchange partners)
3. **users ↔ users** (through favorites table for favorited users)

---

## Sample Queries

### Find users offering a specific skill:
```sql
SELECT u.user_id, u.full_name, u.email, us.proficiency_level, u.rating
FROM users u
JOIN user_skills us ON u.user_id = us.user_id
JOIN skills s ON us.skill_id = s.skill_id
WHERE s.skill_name = 'React Development' 
  AND us.skill_type = 'offering'
  AND us.is_active = TRUE
  AND u.account_status = 'active';
```

### Get all exchanges for a user:
```sql
SELECT 
    e.exchange_id,
    e.status,
    CASE 
        WHEN e.requester_id = ? THEN provider.full_name
        ELSE requester.full_name
    END AS partner_name,
    requested_skill.skill_name AS requested_skill,
    offered_skill.skill_name AS offered_skill,
    e.created_at
FROM exchanges e
JOIN users requester ON e.requester_id = requester.user_id
JOIN users provider ON e.provider_id = provider.user_id
JOIN skills requested_skill ON e.requested_skill_id = requested_skill.skill_id
LEFT JOIN skills offered_skill ON e.offered_skill_id = offered_skill.skill_id
WHERE e.requester_id = ? OR e.provider_id = ?
ORDER BY e.created_at DESC;
```

### Calculate user rating:
```sql
UPDATE users 
SET rating = (
    SELECT AVG(rating) 
    FROM reviews 
    WHERE reviewee_id = ?
)
WHERE user_id = ?;
```

---

## Notes

### Security Considerations:
- All passwords must be hashed using bcrypt or similar
- Email verification required before account activation
- Session management for secure authentication
- Input validation on all user inputs
- SQL injection prevention using prepared statements

### Performance Optimization:
- Add indexes on frequently queried columns
- Consider caching for popular skills/categories
- Implement pagination for skill listings
- Use connection pooling for database connections

### Future Enhancements:
- Add skill_certifications table for verified credentials
- Add exchange_sessions table for scheduled learning sessions
- Add user_preferences table for notification and privacy settings
- Add skill_resources table for sharing learning materials
- Add achievement_badges table for gamification

---

**Last Updated:** November 12, 2025
