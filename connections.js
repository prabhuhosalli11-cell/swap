// Connections Page JavaScript

let connectionsData = [];
let currentFilter = 'all';

// DOM Elements
const connectionsGrid = document.getElementById('connectionsGrid');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');

console.log('Connections.js loaded');

// Fetch connections from API
async function fetchConnections() {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/get_connections.php`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Connections response:', data);

        if (data.success) {
            connectionsData = data.connections || [];
            renderConnections();
        } else {
            showError(data.message || 'Failed to load connections');
        }
    } catch (error) {
        console.error('Error fetching connections:', error);
        showError('Unable to connect to server');
    }
}

// Show loading state
function showLoading() {
    connectionsGrid.style.display = 'none';
    emptyState.style.display = 'none';
    loadingState.style.display = 'flex';
}

// Show error
function showError(message) {
    loadingState.style.display = 'none';
    connectionsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
            <p style="color: #EF4444; margin-bottom: 1rem;">${message}</p>
            <button onclick="fetchConnections()" class="btn-primary">Retry</button>
        </div>
    `;
    connectionsGrid.style.display = 'block';
}

// Filter connections
function filterConnections(status) {
    currentFilter = status;
    
    // Update active tab
    document.querySelectorAll('.connections-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.status === status) {
            tab.classList.add('active');
        }
    });
    
    renderConnections();
}

// Create connection card HTML
function createConnectionCard(connection) {
    const statusBadge = getStatusBadge(connection.status);
    const statusColor = getStatusColor(connection.status);
    const roleText = connection.is_requester ? 'Learning' : 'Teaching';
    const otherPersonName = connection.is_requester ? connection.provider_name : connection.requester_name;
    const otherPersonAvatar = connection.is_requester ? (connection.provider_avatar || '👤') : (connection.requester_avatar || '👤');
    const skillName = connection.requested_skill_name;
    
    return `
        <div class="connection-card" data-status="${connection.status}">
            <!-- Card Header -->
            <div class="connection-header">
                <div class="connection-user">
                    <div class="connection-avatar">${otherPersonAvatar}</div>
                    <div class="connection-user-info">
                        <h3 class="connection-name">${otherPersonName}</h3>
                        <span class="connection-role ${connection.is_requester ? 'learning' : 'teaching'}">
                            ${connection.is_requester ? '📚' : '🎓'} ${roleText}
                        </span>
                    </div>
                </div>
                <span class="status-badge status-${connection.status}" style="background: ${statusColor}">
                    ${statusBadge}
                </span>
            </div>

            <!-- Skill Info -->
            <div class="connection-skill">
                <div class="skill-label">Skill</div>
                <div class="skill-name">${skillName}</div>
            </div>

            <!-- Meeting Preference -->
            ${connection.meeting_preference ? `
                <div class="connection-detail">
                    <span class="detail-icon">${getMeetingIcon(connection.meeting_preference)}</span>
                    <span class="detail-text">${formatMeetingPreference(connection.meeting_preference)}</span>
                </div>
            ` : ''}

            <!-- Message Preview -->
            ${connection.message ? `
                <div class="connection-message">
                    <div class="message-label">Message</div>
                    <p class="message-text">${connection.message}</p>
                </div>
            ` : ''}

            <!-- Dates -->
            <div class="connection-dates">
                <div class="date-item">
                    <span class="date-label">Created</span>
                    <span class="date-value">${formatDate(connection.created_at)}</span>
                </div>
                ${connection.updated_at && connection.updated_at !== connection.created_at ? `
                    <div class="date-item">
                        <span class="date-label">Updated</span>
                        <span class="date-value">${formatDate(connection.updated_at)}</span>
                    </div>
                ` : ''}
            </div>

            <!-- Action Buttons -->
            <div class="connection-actions">
                ${getActionButtons(connection)}
            </div>
        </div>
    `;
}

// Get status badge text
function getStatusBadge(status) {
    const badges = {
        'pending': '⏳ Pending',
        'accepted': '✅ Active',
        'in_progress': '🔄 In Progress',
        'completed': '🎉 Completed',
        'rejected': '❌ Rejected',
        'cancelled': '🚫 Cancelled'
    };
    return badges[status] || status;
}

// Get status color
function getStatusColor(status) {
    const colors = {
        'pending': 'linear-gradient(135deg, #FDB750 0%, #F59E0B 100%)',
        'accepted': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'in_progress': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        'completed': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        'rejected': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'cancelled': 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
    };
    return colors[status] || colors.pending;
}

// Get meeting icon
function getMeetingIcon(preference) {
    const icons = {
        'online': '💻',
        'in_person': '🤝',
        'hybrid': '🔄'
    };
    return icons[preference] || '📍';
}

// Format meeting preference
function formatMeetingPreference(preference) {
    const formats = {
        'online': 'Online Meeting',
        'in_person': 'In-Person Meeting',
        'hybrid': 'Hybrid (Flexible)'
    };
    return formats[preference] || preference;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Get action buttons based on status and role
function getActionButtons(connection) {
    const buttons = [];
    
    // Chat button - always available
    const otherUserId = connection.is_requester ? connection.provider_id : connection.requester_id;
    buttons.push(`
        <button class="action-btn btn-primary" onclick="openChat(${otherUserId})">
            💬 Chat
        </button>
    `);
    
    // Status-specific buttons
    if (connection.status === 'pending') {
        if (!connection.is_requester) {
            // Provider can accept or reject
            buttons.push(`
                <button class="action-btn btn-success" onclick="acceptConnection(${connection.exchange_id})">
                    ✅ Accept
                </button>
                <button class="action-btn btn-danger" onclick="rejectConnection(${connection.exchange_id})">
                    ❌ Decline
                </button>
            `);
        } else {
            // Requester can cancel
            buttons.push(`
                <button class="action-btn btn-secondary" onclick="cancelConnection(${connection.exchange_id})">
                    🚫 Cancel Request
                </button>
            `);
        }
    } else if (connection.status === 'accepted' || connection.status === 'in_progress') {
        buttons.push(`
            <button class="action-btn btn-success" onclick="completeConnection(${connection.exchange_id})">
                ✅ Mark Complete
            </button>
        `);
    }
    
    return buttons.join('');
}

// Render connections
function renderConnections() {
    loadingState.style.display = 'none';
    
    // Filter connections
    let filteredConnections = connectionsData;
    if (currentFilter !== 'all') {
        filteredConnections = connectionsData.filter(c => c.status === currentFilter);
    }
    
    if (filteredConnections.length === 0) {
        connectionsGrid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        connectionsGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        connectionsGrid.innerHTML = filteredConnections.map(conn => createConnectionCard(conn)).join('');
    }
}

// Open chat with user
function openChat(userId) {
    window.location.href = `messages.html?user_id=${userId}`;
}

// Accept connection request
async function acceptConnection(exchangeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/update_exchange.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                exchange_id: exchangeId,
                status: 'accepted'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('✅ Connection accepted!', 'success');
            
            // Update the connection status in local data
            const connection = connectionsData.find(conn => conn.exchange_id === exchangeId);
            if (connection) {
                connection.status = 'accepted';
                connection.updated_at = new Date().toISOString();
            }
            
            // Re-render to update UI immediately
            renderConnections();
        } else {
            showToast(data.message || 'Failed to accept', 'error');
        }
    } catch (error) {
        console.error('Error accepting connection:', error);
        showToast('Server error', 'error');
    }
}

// Reject connection request
async function rejectConnection(exchangeId) {
    if (!confirm('Are you sure you want to decline this connection request?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/update_exchange.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                exchange_id: exchangeId,
                status: 'rejected'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Connection declined', 'success');
            
            // Find and animate the card before removing
            const cards = document.querySelectorAll('.connection-card');
            cards.forEach(card => {
                if (card.querySelector(`[data-user-id="${exchangeId}"]`) || 
                    card.querySelector(`button[onclick*="${exchangeId}"]`)) {
                    card.classList.add('removing');
                }
            });
            
            // Wait for animation to complete before removing from data
            setTimeout(() => {
                // Remove the connection from the local data array
                connectionsData = connectionsData.filter(conn => conn.exchange_id !== exchangeId);
                
                // Re-render to update UI
                renderConnections();
            }, 300);
        } else {
            showToast(data.message || 'Failed to reject', 'error');
        }
    } catch (error) {
        console.error('Error rejecting connection:', error);
        showToast('Server error', 'error');
    }
}

// Cancel connection request
async function cancelConnection(exchangeId) {
    if (!confirm('Are you sure you want to cancel this connection request?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/update_exchange.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                exchange_id: exchangeId,
                status: 'cancelled'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('Connection cancelled', 'success');
            
            // Find and animate the card before removing
            const cards = document.querySelectorAll('.connection-card');
            cards.forEach(card => {
                if (card.querySelector(`[data-user-id="${exchangeId}"]`) || 
                    card.querySelector(`button[onclick*="${exchangeId}"]`)) {
                    card.classList.add('removing');
                }
            });
            
            // Wait for animation to complete before removing from data
            setTimeout(() => {
                // Remove the connection from the local data array
                connectionsData = connectionsData.filter(conn => conn.exchange_id !== exchangeId);
                
                // Re-render to update UI
                renderConnections();
            }, 300);
        } else {
            showToast(data.message || 'Failed to cancel', 'error');
        }
    } catch (error) {
        console.error('Error cancelling connection:', error);
        showToast('Server error', 'error');
    }
}

// Complete connection
async function completeConnection(exchangeId) {
    if (!confirm('Mark this skill exchange as complete?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/update_exchange.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                exchange_id: exchangeId,
                status: 'completed'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showToast('🎉 Exchange completed!', 'success');
            
            // Update the connection status in local data
            const connection = connectionsData.find(conn => conn.exchange_id === exchangeId);
            if (connection) {
                connection.status = 'completed';
                connection.updated_at = new Date().toISOString();
                connection.completed_at = new Date().toISOString();
            }
            
            // Re-render to update UI immediately
            renderConnections();
        } else {
            showToast(data.message || 'Failed to complete', 'error');
        }
    } catch (error) {
        console.error('Error completing connection:', error);
        showToast('Server error', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6';
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${bgColor};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize page
function initializeConnections() {
    console.log('Initializing connections page...');
    fetchConnections();
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeConnections);
} else {
    initializeConnections();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .connections-tabs {
        display: flex;
        gap: 0.5rem;
        margin: 2rem 0;
        flex-wrap: wrap;
    }

    .connections-tab {
        padding: 0.75rem 1.5rem;
        background: white;
        border: 2px solid rgba(201, 169, 97, 0.3);
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        color: #5A4D3B;
        transition: all 0.3s;
    }

    .connections-tab:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .connections-tab.active {
        background: linear-gradient(135deg, #5A5A5A 0%, #4A4A4A 100%);
        color: #FFD966;
        border-color: #C9A961;
    }

    .connections-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
    }

    .connection-card {
        background: linear-gradient(135deg, #FFF9E8 0%, #F5E6C8 100%);
        border: 2px solid rgba(201, 169, 97, 0.4);
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.3s;
        animation: fadeIn 0.5s ease-out;
    }

    .connection-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .connection-card.removing {
        animation: fadeOut 0.3s ease-out forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.9);
            height: 0;
            padding: 0;
            margin: 0;
            border: 0;
        }
    }

    .connection-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 1rem;
    }

    .connection-user {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .connection-avatar {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background: linear-gradient(135deg, #5A5A5A 0%, #4A4A4A 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        border: 2px solid #C9A961;
    }

    .connection-user-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .connection-name {
        font-size: 1.125rem;
        font-weight: 700;
        color: #2C2C2C;
        margin: 0;
    }

    .connection-role {
        font-size: 0.875rem;
        font-weight: 600;
        padding: 0.25rem 0.75rem;
        border-radius: 8px;
        width: fit-content;
    }

    .connection-role.learning {
        background: rgba(59, 130, 246, 0.1);
        color: #2563EB;
    }

    .connection-role.teaching {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
    }

    .status-badge {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 700;
        color: white;
        white-space: nowrap;
    }

    .connection-skill {
        margin: 1rem 0;
        padding: 1rem;
        background: white;
        border-radius: 12px;
        border: 2px solid rgba(201, 169, 97, 0.3);
    }

    .skill-label {
        font-size: 0.75rem;
        color: #5A4D3B;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }

    .skill-name {
        font-size: 1rem;
        font-weight: 700;
        color: #2C2C2C;
    }

    .connection-detail {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0.75rem 0;
        color: #5A4D3B;
        font-weight: 600;
    }

    .connection-message {
        margin: 1rem 0;
        padding: 1rem;
        background: rgba(201, 169, 97, 0.1);
        border-radius: 12px;
    }

    .message-label {
        font-size: 0.75rem;
        color: #5A4D3B;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .message-text {
        font-size: 0.875rem;
        color: #2C2C2C;
        margin: 0;
        line-height: 1.5;
    }

    .connection-dates {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
        font-size: 0.75rem;
    }

    .date-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .date-label {
        color: #5A4D3B;
        font-weight: 600;
    }

    .date-value {
        color: #2C2C2C;
        font-weight: 500;
    }

    .connection-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        flex-wrap: wrap;
    }

    .action-btn {
        flex: 1;
        min-width: 120px;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s;
        border: 2px solid transparent;
    }

    .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .btn-primary {
        background: linear-gradient(135deg, #5A5A5A 0%, #4A4A4A 100%);
        color: #FFD966;
        border-color: #C9A961;
    }

    .btn-success {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        color: white;
    }

    .btn-danger {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        color: white;
    }

    .btn-secondary {
        background: white;
        color: #5A4D3B;
        border-color: rgba(201, 169, 97, 0.4);
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        gap: 1rem;
    }

    .spinner {
        width: 3rem;
        height: 3rem;
        border: 4px solid rgba(201, 169, 97, 0.2);
        border-top-color: #C9A961;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .page-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .page-description {
        color: #5A4D3B;
        font-size: 1rem;
        margin-top: 0.5rem;
    }
`;
document.head.appendChild(style);
