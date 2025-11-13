// API Configuration is already defined in auth.js
// Using the same API_BASE_URL constant from auth.js

// Skills data (loaded from database)
let skillsData = [];

// State
let currentCategory = 'All';
let searchQuery = '';
let isLoading = false;

// DOM Elements
const skillsGrid = document.getElementById('skillsGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');

console.log('Home.js loaded successfully');
console.log('DOM elements:', { skillsGrid, emptyState, searchInput, categoryButtonsCount: categoryButtons.length });

// Fetch skills from API    
async function fetchSkills() {
    console.log('fetchSkills called with:', { currentCategory, searchQuery });
    
    if (isLoading) {
        console.log('Already loading, skipping...');
        return;
    }
    
    isLoading = true;
    showLoading();
    
    try {
        const params = new URLSearchParams();
        if (currentCategory !== 'All') {
            params.append('category', currentCategory);
        }
        if (searchQuery) {
            params.append('search', searchQuery);
        }
        
        const url = `${API_BASE_URL}/get_skills.php${params.toString() ? '?' + params.toString() : ''}`;
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            skillsData = data.skills || [];
            console.log(`Loaded ${skillsData.length} skills`);
            renderSkills();
        } else {
            console.error('Failed to fetch skills:', data.message);
            showError('Failed to load skills. Please try again.');
        }

    } catch (error) {
        console.error('Error fetching skills:', error);
        showError('Unable to connect to server. Please check your connection.');
    } finally {
        isLoading = false;
    }
}

// Show loading state
function showLoading() {
    skillsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
            <p style="color: #6B7280;">Loading skills...</p>
        </div>
    `;
}

// Show error state
function showError(message) {
    skillsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
            <p style="color: #EF4444; margin-bottom: 1rem;">${message}</p>
            <button onclick="fetchSkills()" style="padding: 0.5rem 1rem; background: #3B82F6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Retry</button>
        </div>
    `;
}

// Create skill card HTML
function createSkillCard(skill) {
    const rating = parseFloat(skill.rating) || 0;
    const exchanges = parseInt(skill.exchanges) || 0;
    
    return `
        <div class="skill-card" data-user-id="${skill.user_id}" onclick="toggleSkillCard(this, ${skill.user_id})">
            <!-- Collapsed View -->
            <div class="skill-card-collapsed">
                <div class="skill-header">
                    <div class="skill-user">
                        <div class="skill-avatar" title="${skill.user}'s profile">${skill.avatar || '👤'}</div>
                        <div class="skill-user-info">
                            <h3>${skill.user}</h3>
                            <span class="skill-level">${skill.level || 'Expert'}</span>
                        </div>
                    </div>
                    <div class="skill-stats">
                        <div class="skill-stat-item">
                            <span>⭐</span>
                            <span>${rating.toFixed(1)}</span>
                        </div>
                        <div class="skill-stat-item">
                            <span style="font-size: 0.75rem;">•</span>
                            <span>${exchanges} exchange${exchanges !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
                <p class="skill-description">${skill.description || 'No description available'}</p>
                <div class="skill-exchange">
                    <div class="skill-exchange-item">
                        <span class="skill-exchange-label">Offering</span>
                        <div class="skill-exchange-value">${skill.offering}</div>
                    </div>
                    <div class="skill-exchange-item">
                        <span class="skill-exchange-label">Seeking</span>
                        <div class="skill-exchange-value">${skill.seeking || 'Open to offers'}</div>
                    </div>
                </div>
            </div>

            <!-- Expanded View (Hidden by default) -->
            <div class="skill-card-expanded" style="display: none;">
                <!-- Tabs Navigation -->
                <div class="skill-card-tabs">
                    <button class="skill-card-tab active" onclick="event.stopPropagation(); switchSkillTab(this, 'about')">
                        About
                    </button>
                    <button class="skill-card-tab" onclick="event.stopPropagation(); switchSkillTab(this, 'myskills')">
                        My Skills
                    </button>
                    <button class="skill-card-tab" onclick="event.stopPropagation(); switchSkillTab(this, 'experienced')">
                        Skills Experienced
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="skill-card-tab-content">
                    <!-- About Tab -->
                    <div class="skill-tab-panel active" data-tab="about">
                        <div class="skill-tab-section">
                            <h4>📋 Description</h4>
                            <p>${skill.description || 'No description available'}</p>
                        </div>
                        <div class="skill-tab-section">
                            <h4>⭐ Rating</h4>
                            <p>${rating.toFixed(1)} stars (${exchanges} exchange${exchanges !== 1 ? 's' : ''})</p>
                        </div>
                        <div class="skill-tab-section">
                            <h4>🎓 Experience Level</h4>
                            <p>${skill.level || 'Expert'}</p>
                        </div>
                    </div>

                    <!-- My Skills Tab -->
                    <div class="skill-tab-panel" data-tab="myskills">
                        <div class="skill-tab-section">
                            <h4>💼 Offering</h4>
                            <div class="skill-tag-list">
                                <span class="skill-tag">${skill.offering}</span>
                            </div>
                        </div>
                        <div class="skill-tab-section">
                            <h4>📚 Proficiency</h4>
                            <p>${skill.level || 'Expert'} level in ${skill.offering}</p>
                        </div>
                    </div>

                    <!-- Skills Experienced Tab -->
                    <div class="skill-tab-panel" data-tab="experienced">
                        <div class="skill-tab-section">
                            <h4>🎯 Seeking</h4>
                            <div class="skill-tag-list">
                                <span class="skill-tag seeking">${skill.seeking || 'Open to offers'}</span>
                            </div>
                        </div>
                        <div class="skill-tab-section">
                            <h4>📈 Learning Goals</h4>
                            <p>Interested in learning ${skill.seeking || 'various skills'}</p>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="skill-card-actions">
                    <button class="skill-action-btn skill-connect-btn" onclick="event.stopPropagation(); handleConnectFromCard(${skill.user_id})" data-user-id="${skill.user_id}">
                        💬 Connect
                    </button>
                    <button class="skill-action-btn skill-message-btn" onclick="event.stopPropagation(); handleMessage(${skill.user_id})" data-user-id="${skill.user_id}">
                        ✉️ Message
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Toggle skill card expansion
function toggleSkillCard(cardElement, userId) {
    const collapsed = cardElement.querySelector('.skill-card-collapsed');
    const expanded = cardElement.querySelector('.skill-card-expanded');
    const isExpanded = cardElement.classList.contains('expanded');
    
    // Close all other expanded cards
    document.querySelectorAll('.skill-card.expanded').forEach(card => {
        if (card !== cardElement) {
            card.classList.remove('expanded');
            card.querySelector('.skill-card-collapsed').style.display = 'block';
            card.querySelector('.skill-card-expanded').style.display = 'none';
        }
    });
    
    // Toggle current card
    if (isExpanded) {
        cardElement.classList.remove('expanded');
        collapsed.style.display = 'block';
        expanded.style.display = 'none';
    } else {
        cardElement.classList.add('expanded');
        collapsed.style.display = 'none';
        expanded.style.display = 'block';
    }
}

// Switch tabs within skill card
function switchSkillTab(tabButton, tabName) {
    const card = tabButton.closest('.skill-card');
    const allTabs = card.querySelectorAll('.skill-card-tab');
    const allPanels = card.querySelectorAll('.skill-tab-panel');
    
    // Update tab buttons
    allTabs.forEach(tab => tab.classList.remove('active'));
    tabButton.classList.add('active');
    
    // Update panels
    allPanels.forEach(panel => {
        if (panel.dataset.tab === tabName) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

// Handle Connect button click from skill card
function handleConnectFromCard(userId) {
    console.log('handleConnectFromCard called with userId:', userId);
    const skillCard = skillsData.find(s => s.user_id === userId);
    console.log('Found skill card:', skillCard);
    if (skillCard) {
        openConnectModal(skillCard);
    } else {
        console.error('Skill card not found for user:', userId);
        showToast('Error: Skill not found', 'error');
    }
}

// Legacy function - redirects to handleConnectFromCard
function handleConnect(userId) {
    console.log('handleConnect (legacy) called');
    handleConnectFromCard(userId);
}

// Handle Message button click
function handleMessage(userId) {
    // Redirect to messages page or open message modal
    window.location.href = `messages.html?user_id=${userId}`;
}

// Render skills
function renderSkills() {
    if (skillsData.length === 0) {
        skillsGrid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        skillsGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        skillsGrid.innerHTML = skillsData.map(skill => createSkillCard(skill)).join('');
    }
}

// Initialize when DOM is ready
function initializeHome() {
    console.log('Initializing home page...');
    
    // Event Listeners
    let searchTimeout;
    searchInput.addEventListener('input', function(e) {
        searchQuery = e.target.value;
        
        // Debounce search to avoid too many API calls
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchSkills();
        }, 500);
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update current category
            currentCategory = this.dataset.category;
            // Fetch skills with new category filter
            fetchSkills();
        });
    });

    // Initial load
    console.log('Calling fetchSkills() for initial load...');
    fetchSkills();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHome);
} else {
    // DOM is already ready
    initializeHome();
}

// Store current skill data globally for the modal
let currentConnectSkillData = null;

// Connect Modal Functions
function openConnectModal(skillData) {
    console.log('openConnectModal called with:', skillData);
    
    // Store skill data for form submission
    currentConnectSkillData = skillData;
    console.log('Stored skill data:', currentConnectSkillData);
    
    // Create modal HTML
    const modalHTML = `
        <div id="connectModal" class="modal active" style="display: flex;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">Connect with ${skillData.user}</h3>
                    <button class="modal-close" onclick="closeConnectModal()">&times;</button>
                </div>
                <form id="connectForm">
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                            <div style="font-size: 3rem;">${skillData.avatar}</div>
                            <div>
                                <div style="font-weight: 600; font-size: 1.125rem;">${skillData.user}</div>
                                <div style="color: #6B7280; font-size: 0.875rem;">
                                    ⭐ ${skillData.rating.toFixed(1)} • ${skillData.exchanges} exchanges
                                </div>
                            </div>
                        </div>
                        <div style="padding: 1rem; background: linear-gradient(135deg, rgba(90, 90, 90, 0.1) 0%, rgba(74, 74, 74, 0.1) 100%); border: 2px solid rgba(201, 169, 97, 0.3); border-radius: 12px; margin-bottom: 1rem;">
                            <div style="font-size: 0.875rem; color: #5A4D3B; margin-bottom: 0.25rem; font-weight: 600;">Offering</div>
                            <div style="font-weight: 700; color: #2C2C2C;">${skillData.offering}</div>
                        </div>
                        <div style="padding: 1rem; background: linear-gradient(135deg, rgba(244, 196, 48, 0.15) 0%, rgba(230, 180, 34, 0.15) 100%); border: 2px solid rgba(244, 196, 48, 0.4); border-radius: 12px;">
                            <div style="font-size: 0.875rem; color: #5A4D3B; margin-bottom: 0.25rem; font-weight: 600;">Seeking</div>
                            <div style="font-weight: 700; color: #2C2C2C;">${skillData.seeking}</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 700; color: #2C2C2C;">
                            Your Message (optional)
                        </label>
                        <textarea 
                            id="connectMessage" 
                            style="width: 100%; padding: 0.875rem 1rem; background: white; border: 2px solid rgba(201, 169, 97, 0.4); border-radius: 12px; resize: vertical; min-height: 100px; font-family: inherit; font-size: 1rem; color: #2C2C2C;"
                            placeholder="Hi! I'm interested in learning ${skillData.offering}..."
                        ></textarea>
                    </div>

                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 700; color: #2C2C2C;">
                            Preferred Meeting Type
                        </label>
                        <select 
                            id="meetingPreference" 
                            style="width: 100%; padding: 0.875rem 1rem; background: white; border: 2px solid rgba(201, 169, 97, 0.4); border-radius: 12px; font-family: inherit; font-size: 1rem; color: #2C2C2C; font-weight: 600;"
                        >
                            <option value="online">💻 Online</option>
                            <option value="in_person">🤝 In Person</option>
                            <option value="hybrid">🔄 Hybrid (Flexible)</option>
                        </select>
                    </div>

                    <div style="display: flex; gap: 1rem;">
                        <button 
                            type="button" 
                            onclick="closeConnectModal()" 
                            style="flex: 1; padding: 0.875rem; border: 2px solid rgba(201, 169, 97, 0.4); background: white; border-radius: 12px; cursor: pointer; font-weight: 700; color: #5A4D3B; transition: all 0.3s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
                            onmouseout="this.style.transform=''; this.style.boxShadow='';"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            id="connectSubmitBtn"
                            style="flex: 2; padding: 0.875rem; background: linear-gradient(135deg, #5A5A5A 0%, #4A4A4A 100%); color: #FFD966; border: 2px solid #C9A961; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); transition: all 0.3s;"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.35)';"
                            onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.25)';"
                        >
                            💬 Connect & Start Chatting
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('connectModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit event listener
    const form = document.getElementById('connectForm');
    console.log('Form element found:', form);
    if (form) {
        form.addEventListener('submit', function(event) {
            console.log('Form submitted!');
            event.preventDefault();
            handleConnectSubmit();
        });
        console.log('Event listener added to form');
    } else {
        console.error('Form element not found!');
    }
    
    // Add modal styles
    if (!document.getElementById('modal-styles')) {
        const modalStyles = document.createElement('style');
        modalStyles.id = 'modal-styles';
        modalStyles.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                z-index: 1000;
                display: none;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            }
            .modal.active {
                display: flex !important;
            }
            .modal-content {
                background: linear-gradient(135deg, #FFF9E8 0%, #F5E6C8 100%);
                border-radius: 24px;
                padding: 2rem;
                max-width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
                border: 2px solid rgba(201, 169, 97, 0.4);
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                border-bottom: 2px solid rgba(201, 169, 97, 0.3);
                padding-bottom: 1rem;
            }
            .modal-title {
                font-size: 1.5rem;
                font-weight: 700;
                color: #2C2C2C;
            }
            .modal-close {
                background: linear-gradient(135deg, #5A5A5A 0%, #4A4A4A 100%);
                border: none;
                font-size: 1.25rem;
                cursor: pointer;
                color: #FFD966;
                padding: 0;
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                font-weight: 700;
            }
            .modal-close:hover {
                transform: rotate(90deg);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
        `;
        document.head.appendChild(modalStyles);
    }
}

function closeConnectModal() {
    const modal = document.getElementById('connectModal');
    if (modal) {
        modal.remove();
    }
}

// New function to handle form submission using stored data
async function handleConnectSubmit() {
    console.log('=== handleConnectSubmit called ===');
    console.log('Current skill data:', currentConnectSkillData);
    
    if (!currentConnectSkillData) {
        console.error('❌ No skill data available');
        showToast('Error: No skill data available', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('connectSubmitBtn');
    if (!submitBtn) {
        console.error('❌ Submit button not found!');
        return;
    }
    
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    console.log('Submit button disabled, showing "Sending..."');
    
    try {
        const providerId = currentConnectSkillData.user_id;
        const skillId = currentConnectSkillData.skill_id || currentConnectSkillData.offering_skill_id;
        
        console.log('📤 Connecting to user:', providerId);
        console.log('📚 Using skill ID:', skillId);
        console.log('📋 Full skill data:', currentConnectSkillData);
        
        const message = document.getElementById('connectMessage').value.trim();
        const meetingPreference = document.getElementById('meetingPreference').value || 'online';
        
        const requestBody = {
            provider_id: providerId,
            requested_skill_id: skillId,
            message: message,
            meeting_preference: meetingPreference
        };
        
        console.log('Sending request:', requestBody);
        
        const response = await fetch(`${API_BASE_URL}/connect.php`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            closeConnectModal();
            
            // Show appropriate message
            if (data.already_connected) {
                showToast('💬 Already connected! Opening chat...', 'success');
            } else {
                showToast('✅ Connected! Redirecting to connections... 💬', 'success');
            }
            
            // Redirect to connections page to see the new connection
            setTimeout(() => {
                window.location.href = 'connections.html';
            }, 1000);
        } else {
            showToast(data.message || 'Failed to send request', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error sending connection:', error);
        showToast('Server error. Please check console for details.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
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

// Profile modal removed - use Connect button to interact with users
