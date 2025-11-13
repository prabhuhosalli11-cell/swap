// My Skills Page JavaScript
// Handles CRUD operations for user skills

// State
let userSkills = [];
let allSkills = [];
let currentSkillType = 'offering';
let editingSkillId = null;

// Load skills on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('My Skills page loaded');
    loadAllSkills();
    loadUserSkills();
});

// Load all available skills for dropdown
async function loadAllSkills() {
    try {
        const response = await fetch(`${API_BASE_URL}/get_all_skills_list.php`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            allSkills = data.skills;
            populateSkillsDropdown();
        }
    } catch (error) {
        console.error('Error loading skills list:', error);
    }
}

// Populate skills dropdown with grouped options
function populateSkillsDropdown() {
    const select = document.getElementById('skillSelect');
    const grouped = {};

    // Group skills by category
    allSkills.forEach(skill => {
        const category = skill.category_name;
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(skill);
    });

    // Clear existing options except first
    select.innerHTML = '<option value="">Select a skill...</option>';

    // Add grouped options
    Object.keys(grouped).sort().forEach(category => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${grouped[category][0].icon || ''} ${category}`;

        grouped[category].forEach(skill => {
            const option = document.createElement('option');
            option.value = skill.skill_id;
            option.textContent = skill.skill_name;
            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    });
}

// Load user's skills
async function loadUserSkills() {
    try {
        const response = await fetch(`${API_BASE_URL}/user_skills_crud.php`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            userSkills = data.skills;
            renderSkills();
        } else {
            showError('offering', 'Failed to load skills');
            showError('seeking', 'Failed to load skills');
        }
    } catch (error) {
        console.error('Error loading user skills:', error);
        showError('offering', 'Unable to connect to server');
        showError('seeking', 'Unable to connect to server');
    }
}

// Render skills in their respective sections
function renderSkills() {
    const offeringSkills = userSkills.filter(s => s.skill_type === 'offering');
    const seekingSkills = userSkills.filter(s => s.skill_type === 'seeking');

    renderSkillList('offering', offeringSkills);
    renderSkillList('seeking', seekingSkills);
}

// Render individual skill list
function renderSkillList(type, skills) {
    const container = document.getElementById(`${type}SkillsList`);

    if (skills.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${type === 'offering' ? '🎯' : '🔍'}</div>
                <p>No ${type} skills yet</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Click "Add Skill" to get started</p>
            </div>
        `;
        return;
    }

    container.innerHTML = skills.map(skill => createSkillCard(skill)).join('');
}

// Create skill card HTML
function createSkillCard(skill) {
    const proficiencyClass = skill.proficiency_level ? 
        `proficiency-${skill.proficiency_level}` : '';
    const proficiencyText = skill.proficiency_level ? 
        skill.proficiency_level.charAt(0).toUpperCase() + skill.proficiency_level.slice(1) : 
        'Not specified';

    return `
        <div class="skill-item">
            <div class="skill-item-header">
                <div class="skill-name">${skill.skill_name}</div>
                <span class="skill-category">${skill.icon || ''} ${skill.category_name}</span>
            </div>
            
            <div class="skill-details">
                <div class="skill-detail-item">
                    <span class="skill-detail-label">Level:</span>
                    <span class="proficiency-badge ${proficiencyClass}">${proficiencyText}</span>
                </div>
                ${skill.years_experience ? `
                <div class="skill-detail-item">
                    <span class="skill-detail-label">Experience:</span>
                    <span>${skill.years_experience} year${skill.years_experience !== 1 ? 's' : ''}</span>
                </div>
                ` : ''}
            </div>
            
            ${skill.description ? `
            <p class="skill-description">${skill.description}</p>
            ` : ''}
            
            <div class="skill-actions">
                <button class="skill-action-btn" onclick="editSkill(${skill.user_skill_id})">
                    ✏️ Edit
                </button>
                <button class="skill-action-btn delete" onclick="confirmDeleteSkill(${skill.user_skill_id}, '${skill.skill_name}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `;
}

// Show error message
function showError(type, message) {
    const container = document.getElementById(`${type}SkillsList`);
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">❌</div>
            <p style="color: #EF4444;">${message}</p>
            <button class="add-skill-btn" onclick="loadUserSkills()" style="margin-top: 1rem;">
                Retry
            </button>
        </div>
    `;
}

// Open modal to add skill
function openAddModal(type) {
    currentSkillType = type;
    editingSkillId = null;
    
    document.getElementById('modalTitle').textContent = 
        `Add ${type === 'offering' ? 'Offering' : 'Seeking'} Skill`;
    document.getElementById('submitText').textContent = 'Add Skill';
    
    // Reset form
    document.getElementById('skillForm').reset();
    document.getElementById('skillId').value = '';
    document.getElementById('skillType').value = type;
    
    // Show modal
    document.getElementById('skillModal').classList.add('active');
}

// Edit existing skill
function editSkill(userSkillId) {
    const skill = userSkills.find(s => s.user_skill_id == userSkillId);
    if (!skill) return;

    editingSkillId = userSkillId;
    currentSkillType = skill.skill_type;
    
    document.getElementById('modalTitle').textContent = 'Edit Skill';
    document.getElementById('submitText').textContent = 'Update Skill';
    
    // Fill form
    document.getElementById('skillId').value = skill.user_skill_id;
    document.getElementById('skillType').value = skill.skill_type;
    document.getElementById('skillSelect').value = skill.skill_id;
    document.getElementById('proficiencyLevel').value = skill.proficiency_level || '';
    document.getElementById('yearsExperience').value = skill.years_experience || '';
    document.getElementById('description').value = skill.description || '';
    
    // Disable skill selection when editing
    document.getElementById('skillSelect').disabled = true;
    
    // Show modal
    document.getElementById('skillModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('skillModal').classList.remove('active');
    document.getElementById('skillSelect').disabled = false;
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        skill_id: parseInt(formData.get('skill_id')),
        skill_type: formData.get('skill_type'),
        proficiency_level: formData.get('proficiency_level') || null,
        years_experience: parseInt(formData.get('years_experience')) || 0,
        description: formData.get('description') || null
    };

    try {
        let url = `${API_BASE_URL}/user_skills_crud.php`;
        let method = 'POST';

        if (editingSkillId) {
            // Update existing skill
            method = 'PUT';
            data.user_skill_id = editingSkillId;
            delete data.skill_id; // Can't change skill when editing
            delete data.skill_type; // Can't change type when editing
        }

        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showMessage(result.message, 'success');
            closeModal();
            loadUserSkills(); // Reload skills
        } else {
            showMessage(result.message || 'Operation failed', 'error');
        }
    } catch (error) {
        console.error('Error saving skill:', error);
        showMessage('Unable to save skill. Please try again.', 'error');
    }
}

// Confirm delete
function confirmDeleteSkill(userSkillId, skillName) {
    if (confirm(`Are you sure you want to delete "${skillName}"?`)) {
        deleteSkill(userSkillId);
    }
}

// Delete skill
async function deleteSkill(userSkillId) {
    try {
        const response = await fetch(`${API_BASE_URL}/user_skills_crud.php`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_skill_id: userSkillId })
        });

        const result = await response.json();

        if (result.success) {
            showMessage(result.message, 'success');
            loadUserSkills(); // Reload skills
        } else {
            showMessage(result.message || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Error deleting skill:', error);
        showMessage('Unable to delete skill. Please try again.', 'error');
    }
}

// Show temporary message
function showMessage(message, type = 'info') {
    // Remove existing message if any
    const existingMsg = document.querySelector('.toast-message');
    if (existingMsg) {
        existingMsg.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation styles
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
`;
document.head.appendChild(style);
