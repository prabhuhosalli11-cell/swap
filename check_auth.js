// Authentication check for protected pages
// Include this script on pages that require authentication

(async function() {
    const API_BASE_URL = 'http://localhost/project1/backend/api';
    
    // Check if accessing via file:// protocol
    if (window.location.protocol === 'file:') {
        const message = `
⚠️ WRONG ACCESS METHOD DETECTED!

You're opening files directly from the file system.
This causes CORS errors and the application won't work.

✅ CORRECT WAY:
1. Make sure XAMPP is running
2. Open: http://localhost/project1/index.html

You will be redirected to the help page in 3 seconds...
        `;
        alert(message);
        
        setTimeout(() => {
            window.location.href = 'http://localhost/project1/cors_error_help.html';
        }, 3000);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/check_auth.php`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!data.success || !data.isAuthenticated) {
            // User not authenticated, redirect to signin (no alert to prevent redirect loop)
            window.location.href = 'signin.html';
            return;
        }

        // User is authenticated, update UI with user info
        if (data.user) {
            // Update user avatar
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar) {
                const initials = data.user.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
                userAvatar.textContent = initials;
                userAvatar.title = data.user.full_name;
            }

            // Store user info for other scripts
            localStorage.setItem('user', JSON.stringify(data.user));
        }

    } catch (error) {
        console.error('Auth check failed:', error);
        // On network error, allow staying on page but warn user
        console.warn('Unable to verify authentication. You may be logged out.');
    }
})();
