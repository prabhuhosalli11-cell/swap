// Authentication handling for signup and signin pages

// API Base URL - Update this to your backend URL
const API_BASE_URL = 'http://localhost/project1/backend/api';

// Check if accessing via file:// protocol
if (window.location.protocol === 'file:') {
    const currentPage = window.location.pathname.split('/').pop();
    alert(`⚠️ CORS ERROR WILL OCCUR!\n\nYou're opening ${currentPage} directly from file system.\n\n✅ Correct way: Open http://localhost/project1/${currentPage}\n\nMake sure XAMPP is running first!`);
}

// Helper function to show messages
function showMessage(message, type = 'info') {
    alert(message);
}

// Password strength validation (must match backend config)
function validatePasswordStrength(password) {
    const errors = [];
    const minLength = 8; // Must match PASSWORD_MIN_LENGTH in config.php
    
    if (password.length < minLength) {
        errors.push(`• At least ${minLength} characters`);
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('• At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('• At least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('• At least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('• At least one special character (!@#$%^&*)');
    }
    
    return errors;
}

// Helper function to show loading state
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Loading...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}

// Sign Up Form Handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = signupForm.querySelector('button[type="submit"]');
        
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }

        // Validate password strength (must match backend requirements)
        const passwordErrors = validatePasswordStrength(formData.password);
        if (passwordErrors.length > 0) {
            showMessage('Password requirements:\n' + passwordErrors.join('\n'), 'error');
            return;
        }

        try {
            setLoadingState(submitButton, true);

            const response = await fetch(`${API_BASE_URL}/signup.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                showMessage('Registration successful! Please sign in.', 'success');
                // Redirect to signin page
                setTimeout(() => {
                    window.location.href = 'signin.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Registration failed. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Signup error:', error);
            showMessage('Unable to connect to server. Please try again later.', 'error');
        } finally {
            setLoadingState(submitButton, false);
        }
    });
}

// Sign In Form Handler
const signinForm = document.getElementById('signinForm');
if (signinForm) {
    signinForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = signinForm.querySelector('button[type="submit"]');
        
        const formData = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            remember: document.getElementById('remember')?.checked || false
        };

        // Basic validation
        if (!formData.email || !formData.password) {
            showMessage('Please enter both email and password', 'error');
            return;
        }

        try {
            setLoadingState(submitButton, true);

            const response = await fetch(`${API_BASE_URL}/signin.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for session cookies
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Store user info in localStorage
                // NOTE: we intentionally do NOT store session tokens in localStorage for security.
                // Backend uses PHP session cookie (sent automatically when credentials: 'include').
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showMessage('Login successful!', 'success');
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
            } else {
                showMessage(data.message || 'Login failed. Please check your credentials.', 'error');
            }

        } catch (error) {
            console.error('Signin error:', error);
            showMessage('Unable to connect to server. Please try again later.', 'error');
        } finally {
            setLoadingState(submitButton, false);
        }
    });
}

// Social login buttons (mock functionality)
const socialButtons = document.querySelectorAll('.social-btn');
socialButtons.forEach(button => {
    button.addEventListener('click', function() {
        showMessage('Social login coming soon!', 'info');
        // In real app, handle OAuth flow
    });
});

// Logout button handler (works on pages that include this script)
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();

        // Store original button state
        const originalText = logoutBtn.textContent;
        logoutBtn.disabled = true;
        logoutBtn.textContent = 'Logging out...';

        try {
            const response = await fetch(`${API_BASE_URL}/logout.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                // Clear client-side stored user info
                localStorage.removeItem('user');

                logoutBtn.textContent = 'Success!';
                
                // Redirect to signin page
                setTimeout(() => {
                    window.location.href = 'signin.html';
                }, 500);
            } else {
                showMessage(data.message || 'Logout failed', 'error');
                logoutBtn.disabled = false;
                logoutBtn.textContent = originalText;
            }
        } catch (err) {
            console.error('Logout error:', err);
            showMessage('Unable to logout. Please try again.', 'error');
            logoutBtn.disabled = false;
            logoutBtn.textContent = originalText;
        }
    });
}
