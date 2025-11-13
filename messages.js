// Messages Page JavaScript

let conversations = [];
let currentUserId = null;
let messages = [];
let refreshInterval = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Messages page loaded');
    loadConversations();
    
    // Auto-refresh messages every 5 seconds when a chat is open
    refreshInterval = setInterval(() => {
        if (currentUserId) {
            loadMessages(currentUserId, false); // false = don't scroll
        }
    }, 5000);
});

// Load all conversations
async function loadConversations() {
    try {
        const response = await fetch(`${API_BASE_URL}/get_conversations.php`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            conversations = data.conversations;
            renderConversations();
            
            // Auto-open the most recent conversation (first in the list)
            if (conversations.length > 0 && !currentUserId) {
                selectConversation(conversations[0].other_user_id);
            }
        } else {
            showConversationsError('Failed to load conversations');
        }
    } catch (error) {
        console.error('Error loading conversations:', error);
        showConversationsError('Unable to connect to server');
    }
}

// Render conversations list
function renderConversations() {
    const container = document.getElementById('conversationsList');

    if (conversations.length === 0) {
        container.innerHTML = `
            <div style="padding: 3rem 1rem; text-align: center; color: #6B7280;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                <p>No conversations yet</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Connect with people to start chatting!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = conversations.map(conv => {
        const isActive = conv.other_user_id === currentUserId ? 'active' : '';
        const time = formatTime(conv.last_message_time);
        
        return `
            <div class="conversation-item ${isActive}" onclick="selectConversation(${conv.other_user_id})">
                <div class="conversation-avatar">${conv.avatar}</div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <span class="conversation-name">${conv.full_name}</span>
                        ${conv.unread_count > 0 ? `<span class="unread-badge">${conv.unread_count}</span>` : `<span class="conversation-time">${time}</span>`}
                    </div>
                    <p class="conversation-preview">${conv.last_message || 'No messages yet'}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Show conversations error
function showConversationsError(message) {
    const container = document.getElementById('conversationsList');
    container.innerHTML = `
        <div style="padding: 3rem 1rem; text-align: center; color: #6B7280;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
            <p style="color: #EF4444;">${message}</p>
            <button onclick="loadConversations()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3B82F6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                Retry
            </button>
        </div>
    `;
}

// Select a conversation
async function selectConversation(userId) {
    currentUserId = userId;
    renderConversations(); // Re-render to show active state
    await loadMessages(userId, true); // true = scroll to bottom
    
    // Mark messages as read
    markAsRead(userId);
}

// Load messages with a user
async function loadMessages(userId, scrollToBottom = true) {
    try {
        const response = await fetch(`${API_BASE_URL}/messages_crud.php?user_id=${userId}`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            messages = data.messages;
            const otherUser = data.other_user;
            renderChat(otherUser, scrollToBottom);
        } else {
            showChatError('Failed to load messages');
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        showChatError('Unable to load messages');
    }
}

// Render chat area
function renderChat(otherUser, scrollToBottom = true) {
    const chatArea = document.getElementById('chatArea');
    
    chatArea.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-avatar">${otherUser.avatar}</div>
            <div class="chat-header-info">
                <h3>${otherUser.full_name}</h3>
                <div class="chat-header-status">⭐ ${parseFloat(otherUser.rating).toFixed(1)} rating</div>
            </div>
        </div>
        
        <div class="messages-area" id="messagesArea">
            ${messages.length === 0 ? `
                <div style="text-align: center; color: #6B7280; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">👋</div>
                    <p>No messages yet. Say hi to ${otherUser.full_name}!</p>
                </div>
            ` : messages.map(msg => `
                <div class="message ${msg.is_own ? 'own' : ''}">
                    <div class="message-avatar">${msg.sender_avatar}</div>
                    <div class="message-content">
                        <div class="message-bubble">${escapeHtml(msg.message_text)}</div>
                        <div class="message-time">${formatMessageTime(msg.created_at)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="message-input-area">
            <form class="message-input-form" onsubmit="sendMessage(event, ${otherUser.user_id})">
                <input 
                    type="text" 
                    class="message-input" 
                    id="messageInput"
                    placeholder="Type a message..." 
                    required
                    autocomplete="off"
                >
                <button type="submit" class="send-btn">Send</button>
            </form>
        </div>
    `;
    
    if (scrollToBottom) {
        scrollChatToBottom();
    }
}

// Show chat error
function showChatError(message) {
    const chatArea = document.getElementById('chatArea');
    chatArea.innerHTML = `
        <div class="empty-chat">
            <div class="empty-chat-icon">❌</div>
            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #EF4444;">${message}</h3>
            <button onclick="loadMessages(${currentUserId}, true)" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #3B82F6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                Retry
            </button>
        </div>
    `;
}

// Send a message
async function sendMessage(event, receiverId) {
    event.preventDefault();
    
    const input = document.getElementById('messageInput');
    const messageText = input.value.trim();
    
    if (!messageText) return;
    
    // Disable input while sending
    input.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/messages_crud.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                receiver_id: receiverId,
                message_text: messageText
            })
        });

        const data = await response.json();

        if (data.success) {
            input.value = '';
            input.disabled = false;
            input.focus();
            
            // Reload messages
            await loadMessages(receiverId, true);
            
            // Reload conversations to update preview
            loadConversations();
        } else {
            showToast(data.message || 'Failed to send message', 'error');
            input.disabled = false;
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Unable to send message', 'error');
        input.disabled = false;
    }
}

// Mark messages as read
async function markAsRead(senderId) {
    try {
        await fetch(`${API_BASE_URL}/messages_crud.php`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender_id: senderId
            })
        });
        
        // Reload conversations to update unread count
        loadConversations();
    } catch (error) {
        console.error('Error marking as read:', error);
    }
}

// Utility functions
function scrollChatToBottom() {
    setTimeout(() => {
        const messagesArea = document.getElementById('messagesArea');
        if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    }, 100);
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

function formatMessageTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
        return time;
    } else {
        return `${date.toLocaleDateString()} ${time}`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});
