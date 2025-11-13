# SkillXchange - Complete Project Details

## 📋 Project Overview

**Project Name:** SkillXchange  
**Type:** Web Application - Skill Exchange Platform  
**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, PHP, MySQL  
**Purpose:** A platform where users can exchange skills - offer what they know and learn what they need  

---

## 🎯 Project Description

SkillXchange is a modern, minimalistic web application that connects people who want to exchange skills. Users can:
- Create accounts and manage profiles
- List skills they can teach (offering)
- List skills they want to learn (seeking)
- Browse other users' skill offerings
- Request skill exchanges with other users
- Rate and review exchange partners
- Communicate via messaging
- Track their exchange history

The platform promotes peer-to-peer learning and skill sharing without monetary transactions.

---

## 🏗️ System Architecture

### **Frontend Layer (Client-Side)**
- **Technology:** Pure HTML5, CSS3, Vanilla JavaScript (ES6)
- **Pages:** 4 main pages
  - `index.html` - Landing/Welcome page
  - `signup.html` - User registration
  - `signin.html` - User login
  - `home.html` - Main dashboard with skill listings
- **Styling:** Custom CSS with minimalistic gray/black theme
- **No Frameworks:** No React, Vue, or Angular - pure vanilla implementation

### **Backend Layer (Server-Side)**
- **Technology:** PHP 7.4+
- **API Architecture:** RESTful API endpoints
- **Database Access:** PDO (PHP Data Objects) for secure queries
- **Session Management:** PHP sessions with token-based authentication
- **Security:** Bcrypt password hashing, prepared statements, CORS configuration

### **Database Layer**
- **Technology:** MySQL 5.7+
- **Database Name:** `skillxchange_db`
- **Storage Engine:** InnoDB
- **Character Set:** UTF-8 (utf8mb4)
- **Tables:** 10 normalized tables with foreign key relationships

### **Server Environment**
- **Development:** XAMPP (Apache + MySQL + PHP)
- **Web Server:** Apache 2.4
- **Port:** 80 (HTTP)
- **Database Port:** 3306 (MySQL)

---

## 📁 Complete File Structure

```
project1/
│
├── Frontend Files
│   ├── index.html              # Landing page with hero section, features, stats
│   ├── signup.html             # Registration form with validation
│   ├── signin.html             # Login form with remember me option
│   ├── home.html               # Main app - skill listings with search/filter
│   ├── styles.css              # Complete stylesheet (630+ lines)
│   ├── auth.js                 # Authentication logic - API calls for signup/signin
│   └── home.js                 # Home page logic - skill data, search, filter
│
├── Backend Files
│   └── backend/
│       ├── config/
│       │   ├── database.php    # Database connection class (PDO)
│       │   └── cors.php        # CORS headers configuration
│       │
│       ├── api/
│       │   ├── signup.php      # POST - User registration endpoint
│       │   ├── signin.php      # POST - User login endpoint
│       │   ├── logout.php      # POST - User logout endpoint
│       │   └── check_auth.php  # GET - Authentication verification
│       │
│       └── database_setup.sql  # Complete database creation script
│
└── Documentation Files
    ├── database.md             # Complete database schema documentation
    ├── README_BACKEND.md       # Backend setup and implementation guide
    ├── QUICK_START.md          # 3-step quick start guide
    └── DETAILS.md              # This file - complete project details
```

---

## 🗄️ Database Architecture

### **Database Name:** `skillxchange_db`

### **10 Tables Overview:**

#### 1. **users** (Main user accounts)
- **Purpose:** Store user account information and profiles
- **Key Fields:** user_id, full_name, email, password_hash, rating, total_exchanges
- **Rows:** Stores all registered users
- **Relationships:** Has many skills, exchanges, reviews, messages

#### 2. **skill_categories** (Skill categories)
- **Purpose:** Categorize skills into logical groups
- **Key Fields:** category_id, category_name, icon, description
- **Pre-loaded Data:** 8 categories (Programming, Design, Music, Languages, Business, Photography, Writing, Sports)
- **Relationships:** Has many skills

#### 3. **skills** (Available skills)
- **Purpose:** Master list of all skills in the system
- **Key Fields:** skill_id, skill_name, category_id, description
- **Pre-loaded Data:** 15 skills (React, Python, UI/UX, Guitar, etc.)
- **Relationships:** Belongs to category, has many user_skills

#### 4. **user_skills** (Junction table)
- **Purpose:** Link users to skills they offer or seek
- **Key Fields:** user_skill_id, user_id, skill_id, skill_type (offering/seeking), proficiency_level
- **Relationships:** Belongs to user and skill

#### 5. **exchanges** (Skill exchange requests)
- **Purpose:** Track skill exchange requests between users
- **Key Fields:** exchange_id, requester_id, provider_id, requested_skill_id, status
- **Statuses:** pending, accepted, rejected, in_progress, completed, cancelled
- **Relationships:** Links two users and their skills

#### 6. **reviews** (User reviews and ratings)
- **Purpose:** Store ratings and reviews after exchanges
- **Key Fields:** review_id, exchange_id, reviewer_id, reviewee_id, rating (1-5), comment
- **Relationships:** Belongs to exchange and users

#### 7. **messages** (Direct messaging)
- **Purpose:** Enable communication between users
- **Key Fields:** message_id, sender_id, receiver_id, message_text, is_read
- **Relationships:** Between two users, optionally linked to exchange

#### 8. **notifications** (System notifications)
- **Purpose:** Notify users of events (new requests, messages, etc.)
- **Key Fields:** notification_id, user_id, type, title, message, is_read
- **Types:** exchange_request, exchange_accepted, new_message, review_received, system
- **Relationships:** Belongs to user

#### 9. **favorites** (Favorited users)
- **Purpose:** Allow users to save favorite skill providers
- **Key Fields:** favorite_id, user_id, favorited_user_id
- **Relationships:** Many-to-many between users

#### 10. **sessions** (Login sessions)
- **Purpose:** Track active user sessions for security
- **Key Fields:** session_id, user_id, ip_address, expires_at
- **Relationships:** Belongs to user

### **Database Triggers:**
1. **update_user_rating_after_review** - Automatically updates user's average rating when new review is added
2. **update_exchange_count_after_completion** - Increments total_exchanges for both users when exchange completes

---

## 🔐 Security Implementation

### **Password Security**
- **Hashing Algorithm:** Bcrypt (password_hash with PASSWORD_BCRYPT)
- **Salt:** Automatically generated per user
- **Cost Factor:** Default (10 rounds)
- **Storage:** 255-character hash stored in database
- **Verification:** password_verify() used for login

### **SQL Injection Prevention**
- **Method:** PDO prepared statements with parameter binding
- **Implementation:** All queries use placeholders (`:email`, `:password`, etc.)
- **No Raw SQL:** Zero direct string concatenation in queries

### **Cross-Site Scripting (XSS) Prevention**
- **Input Validation:** Email format validation, password length checks
- **Output Encoding:** JSON responses properly encoded
- **Content-Type Headers:** Proper MIME types set

### **CORS (Cross-Origin Resource Sharing)**
- **Configuration:** `backend/config/cors.php`
- **Allowed Origins:** Currently `*` (for development)
- **Allowed Methods:** POST, GET, OPTIONS
- **Headers:** Content-Type, Authorization, X-Requested-With

### **Session Security**
- **Session Token:** 64-character random hex token generated per login
- **Storage:** Token stored in database with expiration (7 days)
- **Validation:** Token verified on each authenticated request
- **Cleanup:** Sessions destroyed on logout

### **Account Protection**
- **Email Uniqueness:** Enforced at database level (UNIQUE constraint)
- **Account Status:** Can be active, inactive, or suspended
- **Email Verification:** Field exists for future implementation

---

## 🎨 Frontend Design System

### **Color Palette**
- **Background:** #F9FAFB (Light gray)
- **Primary Text:** #111827 (Almost black)
- **Secondary Text:** #6B7280 (Medium gray)
- **Borders:** #E5E7EB (Light gray)
- **Hover States:** #1F2937 (Darker gray)

### **Typography**
- **Font Family:** -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Headings:** Bold, varying sizes (24px-48px)
- **Body Text:** 16px normal weight
- **Small Text:** 14px for secondary information

### **Layout & Spacing**
- **Max Width:** 1200px for content areas
- **Padding:** Consistent 24px-48px padding
- **Border Radius:** 8-16px for rounded corners
- **Shadows:** Subtle shadows on hover (0 4px 12px rgba)

### **Components**
- **Buttons:** Rounded (8px), padded (12px 24px), hover effects
- **Forms:** Clean inputs with focus states, error validation
- **Cards:** Bordered cards with hover lift effect
- **Grid:** Responsive grid layouts (1/2/3 columns based on screen size)

### **Responsive Breakpoints**
- **Mobile:** < 640px (single column)
- **Tablet:** 640px - 1024px (two columns)
- **Desktop:** > 1024px (three columns)

---

## 🔌 API Endpoints Documentation

### **Base URL:** `http://localhost/project1/backend/api`

### **1. User Registration**
```
POST /signup.php
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user_id": 5
}
```

**Error Response (400/409/500):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Validation Rules:**
- All fields required
- Email must be valid format
- Password minimum 6 characters
- Passwords must match
- Email must be unique

---

### **2. User Login**
```
POST /signin.php
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "user_id": 5,
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "token": "a1b2c3d4e5f6...64char_hex_token"
}
```

**Error Response (401/403/500):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Side Effects:**
- Creates PHP session
- Generates session token
- Stores session in database
- Updates user's last login time

---

### **3. Check Authentication**
```
GET /check_auth.php
```

**Request:** Session cookie required (sent automatically by browser)

**Success Response (200):**
```json
{
  "success": true,
  "isAuthenticated": true,
  "user": {
    "user_id": 5,
    "full_name": "John Doe",
    "email": "john@example.com",
    "profile_picture": null,
    "rating": 4.5,
    "total_exchanges": 10
  }
}
```

**Not Authenticated Response (401):**
```json
{
  "success": false,
  "message": "Not authenticated",
  "isAuthenticated": false
}
```

---

### **4. User Logout**
```
POST /logout.php
```

**Request:** Session cookie required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Side Effects:**
- Destroys PHP session
- Clears all session variables
- Removes session cookie

---

## 📊 Data Flow Examples

### **User Registration Flow:**
```
1. User fills signup form (signup.html)
   ↓
2. JavaScript validates input (auth.js)
   - Check all fields filled
   - Validate email format
   - Check passwords match
   - Check password length >= 6
   ↓
3. AJAX POST to /api/signup.php
   - Send JSON: {fullName, email, password, confirmPassword}
   ↓
4. PHP validates data (signup.php)
   - Re-validate all fields
   - Check email doesn't exist in database
   ↓
5. Hash password with bcrypt
   ↓
6. Insert user into database
   - INSERT INTO users (full_name, email, password_hash, created_at)
   ↓
7. Return success response with user_id
   ↓
8. JavaScript shows success message
   ↓
9. Redirect to signin.html after 1.5 seconds
```

---

### **User Login Flow:**
```
1. User fills signin form (signin.html)
   ↓
2. JavaScript validates input (auth.js)
   - Check email and password provided
   ↓
3. AJAX POST to /api/signin.php
   - Send JSON: {email, password}
   - Include credentials for cookies
   ↓
4. PHP queries database (signin.php)
   - SELECT user WHERE email = :email
   ↓
5. Check if user exists
   ↓
6. Verify password hash
   - password_verify(input, stored_hash)
   ↓
7. Check account status is 'active'
   ↓
8. Create PHP session
   - Store user_id, full_name, email
   ↓
9. Generate session token (64-char hex)
   ↓
10. Store session in database
    - INSERT INTO sessions (session_id, user_id, expires_at)
    ↓
11. Return user data + token
    ↓
12. JavaScript stores data
    - localStorage.setItem('user', JSON.stringify(user))
    - localStorage.setItem('token', token)
    ↓
13. Redirect to home.html
```

---

### **Skill Search Flow (Frontend - home.js):**
```
1. User types in search box
   ↓
2. Event listener captures input (keyup event)
   ↓
3. filterSkills() function called
   - Get search query
   - Get selected category
   ↓
4. Filter skillsData array
   - Match against user name (case-insensitive)
   - Match against offering skill
   - Match against seeking skill
   - Filter by category if not "All"
   ↓
5. renderSkills() with filtered results
   - Clear skills grid
   - Create card for each skill
   - Show empty state if no results
   ↓
6. Update DOM with results
```

---

## 🚀 Deployment Setup

### **Current Setup (Development):**
- **Location:** `C:\xampp\htdocs\project1\`
- **Access URL:** `http://localhost/project1/index.html`
- **API URL:** `http://localhost/project1/backend/api`
- **Database:** Local MySQL on port 3306

### **Installation Steps:**
1. Install XAMPP
2. Copy project to `C:\xampp\htdocs\project1\`
3. Start Apache and MySQL in XAMPP
4. Run `backend/database_setup.sql` in phpMyAdmin
5. Access `http://localhost/project1/index.html`

### **Configuration Files:**
- **Database Config:** `backend/config/database.php`
  ```php
  $host = "localhost";
  $db_name = "skillxchange_db";
  $username = "root";
  $password = "";
  ```
- **API URL:** `auth.js` line 4
  ```javascript
  const API_BASE_URL = 'http://localhost/project1/backend/api';
  ```

---

## 🧪 Testing

### **Test User Account:**
- **Email:** test@example.com
- **Password:** password123
- **Profile:** John Doe, 4.5 rating, 10 exchanges
- **Skills:** 
  - Offering: React Development (expert)
  - Seeking: UI/UX Design

### **Test Data Included:**
- 1 test user
- 8 skill categories
- 15 skills across categories
- 2 user_skills for test user

### **Manual Testing Checklist:**
- [ ] User can register new account
- [ ] Email validation works
- [ ] Password match validation works
- [ ] Duplicate email prevented
- [ ] User can login with credentials
- [ ] Wrong password rejected
- [ ] Session persists on page refresh
- [ ] User can logout
- [ ] Search filters skills correctly
- [ ] Category filter works
- [ ] Responsive design on mobile

---

## 📈 Future Enhancements (Not Yet Implemented)

### **Phase 1 - Core Features:**
- [ ] User profile pages with edit functionality
- [ ] Skill management (add/remove skills user offers/seeks)
- [ ] Real exchange request system
- [ ] Accept/reject exchange requests
- [ ] Exchange status tracking

### **Phase 2 - Communication:**
- [ ] Real-time messaging system
- [ ] Notifications system
- [ ] Email notifications
- [ ] In-app notification bell

### **Phase 3 - Social Features:**
- [ ] User reviews and ratings
- [ ] Favorites/bookmarks
- [ ] User search and discovery
- [ ] Skill recommendations
- [ ] User profiles with portfolios

### **Phase 4 - Advanced:**
- [ ] Email verification on signup
- [ ] Password reset functionality
- [ ] OAuth social login (Google, GitHub)
- [ ] Advanced search filters
- [ ] Location-based matching
- [ ] Schedule/calendar integration
- [ ] Video call integration

### **Phase 5 - Production:**
- [ ] Production database setup
- [ ] HTTPS/SSL certificate
- [ ] Domain and hosting
- [ ] CDN for static assets
- [ ] Redis for session storage
- [ ] Rate limiting on APIs
- [ ] Admin dashboard
- [ ] Analytics and reporting

---

## 🐛 Known Issues & Limitations

### **Current Limitations:**
1. **No Email Verification** - Users can register with any email
2. **No Password Reset** - Users cannot reset forgotten passwords
3. **Session Storage** - Sessions stored in PHP files (not scalable)
4. **No Rate Limiting** - APIs can be called unlimited times
5. **Static Skills** - Skills are pre-defined, users can't add new ones
6. **Mock Data on Frontend** - home.js uses hardcoded skill data (not from database)
7. **No Image Uploads** - Profile pictures not implemented
8. **No Real Messaging** - Messages table exists but no UI
9. **No Notifications** - Notifications table exists but no system
10. **CORS Wide Open** - Allows all origins (security risk in production)

### **Browser Compatibility:**
- **Tested:** Chrome, Firefox, Edge (latest versions)
- **Not Tested:** Safari, IE11
- **Mobile:** Responsive but not extensively tested

---

## 📚 Technologies Used

### **Frontend:**
- HTML5 (Semantic markup)
- CSS3 (Flexbox, Grid, Custom properties)
- JavaScript ES6+ (Fetch API, Arrow functions, Template literals)
- No external libraries or frameworks

### **Backend:**
- PHP 7.4+ (OOP, PDO, Sessions)
- No PHP frameworks (Pure PHP)

### **Database:**
- MySQL 5.7+ / MariaDB
- InnoDB storage engine
- UTF-8 character encoding

### **Development Tools:**
- XAMPP (Apache, MySQL, PHP stack)
- phpMyAdmin (Database management)
- VS Code (Code editor)
- Git (Version control)

### **Development Principles:**
- RESTful API design
- Separation of concerns (Frontend/Backend)
- Database normalization (3NF)
- Responsive design (Mobile-first)
- Security best practices
- Clean code principles

---

## 📞 Support & Maintenance

### **Documentation Files:**
- `DETAILS.md` - This complete project documentation
- `README_BACKEND.md` - Backend setup guide
- `QUICK_START.md` - 3-step quick start
- `database.md` - Complete database schema

### **Useful Queries:**

**Check database exists:**
```sql
SHOW DATABASES LIKE 'skillxchange_db';
```

**Check all tables:**
```sql
USE skillxchange_db;
SHOW TABLES;
```

**View all users:**
```sql
SELECT user_id, full_name, email, rating, total_exchanges, created_at FROM users;
```

**View skills with categories:**
```sql
SELECT s.skill_name, sc.category_name 
FROM skills s 
JOIN skill_categories sc ON s.category_id = sc.category_id 
ORDER BY sc.category_name;
```

**Find user's skills:**
```sql
SELECT u.full_name, s.skill_name, us.skill_type, us.proficiency_level
FROM user_skills us
JOIN users u ON us.user_id = u.user_id
JOIN skills s ON us.skill_id = s.skill_id
WHERE u.email = 'test@example.com';
```

---

## 📊 Project Statistics

- **Total Files:** 15
- **Lines of Code (estimated):**
  - HTML: ~800 lines
  - CSS: ~630 lines
  - JavaScript: ~350 lines
  - PHP: ~600 lines
  - SQL: ~400 lines
  - **Total:** ~2,780 lines
- **Database Tables:** 10
- **API Endpoints:** 4
- **Documentation:** ~3,500 lines

---

## 🎯 Project Goals Achieved

✅ User registration and authentication system  
✅ Secure password hashing  
✅ Session management  
✅ Database design and implementation  
✅ RESTful API endpoints  
✅ Responsive frontend design  
✅ Search and filter functionality  
✅ Complete documentation  

---

## 🏆 Project Highlights

1. **Pure Vanilla Implementation** - No frontend frameworks, showcasing fundamental web development skills
2. **Security First** - Bcrypt hashing, prepared statements, CORS configuration
3. **Scalable Database** - Normalized design with 10 tables ready for expansion
4. **Clean Architecture** - Clear separation between frontend, backend, and database layers
5. **Complete Documentation** - Extensive docs for easy understanding and maintenance
6. **Ready for Production** - Clear path to deployment with defined enhancement phases

---

**Project Created:** November 2025  
**Last Updated:** November 12, 2025  
**Version:** 1.0.0 (MVP)  
**Status:** Development Complete, Ready for Testing  

---

*This is a complete skill exchange platform foundation ready for further development and feature additions.*
