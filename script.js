/* Initial team members and avatars */
let avatars = JSON.parse(localStorage.getItem('avatars')) || {
    Alice: 'https://randomuser.me/api/portraits/women/1.jpg',
    Bob: 'https://randomuser.me/api/portraits/men/1.jpg',
    Charlie: 'https://randomuser.me/api/portraits/men/2.jpg'
};

/* Load tasks from localStorage or initialize empty array */
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

/* DOM elements */
const taskInput = document.getElementById('taskInput');
const teamMemberSelect = document.getElementById('teamMember');
const prioritySelect = document.getElementById('priority');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const addMemberBtn = document.getElementById('addMemberBtn');
const memberModal = document.getElementById('memberModal');
const memberNameInput = document.getElementById('memberName');
const memberAvatarUrlInput = document.getElementById('memberAvatarUrl');
const memberAvatarFileInput = document.getElementById('memberAvatarFile');
const saveMemberBtn = document.getElementById('saveMemberBtn');
const cancelMemberBtn = document.getElementById('cancelMemberBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const avatarSourceRadios = document.getElementsByName('avatarSource');

/* Toggle avatar input visibility based on radio selection */
function toggleAvatarInputs() {
    const selectedSource = document.querySelector('input[name="avatarSource"]:checked').value;
    memberAvatarUrlInput.classList.toggle('hidden', selectedSource !== 'url');
    memberAvatarFileInput.classList.toggle('hidden', selectedSource !== 'upload');
}

/* Render team members in dropdown */
function renderTeamMembers() {
    teamMemberSelect.innerHTML = '<option value="">Select Team Member</option>';
    Object.keys(avatars).forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        teamMemberSelect.appendChild(option);
    });
}

/* Render tasks */
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item flex items-center justify-between glassmorphic-card p-4 task-enter';
        li.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="${avatars[task.member] || 'https://randomuser.me/api/portraits/lego/1.jpg'}" alt="${task.member}" class="avatar">
                <div>
                    <span class="${task.completed ? 'task-completed' : ''} font-rubik">${task.description}</span>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-sm text-gray-400 font-rubik">${task.member}</span>
                        <span class="text-xs text-white px-2 py-1 rounded-full priority-${task.priority} font-inter">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                    </div>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="toggleComplete(${index})" class="text-green hover:text-green-hover font-inter transition-transform">Complete</button>
                <button onclick="deleteTask(${index})" class="text-red hover:text-red-hover font-inter transition-transform">Delete</button>
            </div>
        `;
        taskList.appendChild(li);
    });
    saveTasks();
}

/* Add new task with loading animation */
function addTask() {
    const description = taskInput.value.trim();
    const member = teamMemberSelect.value;
    const priority = prioritySelect.value;

    if (description && member && priority) {
        loadingSpinner.classList.remove('hidden');
        addTaskBtn.disabled = true;
        setTimeout(() => {
            tasks.push({
                description,
                member,
                priority,
                completed: false
            });
            taskInput.value = '';
            teamMemberSelect.value = '';
            prioritySelect.value = '';
            loadingSpinner.classList.add('hidden');
            addTaskBtn.disabled = false;
            renderTasks();
        }, 300); /* Brief delay for smooth feedback */
    } else {
        alert('Please fill in all fields.');
    }
}

/* Toggle task completion */
function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

/* Delete task */
function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

/* Save tasks and avatars to localStorage */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('avatars', JSON.stringify(avatars));
}

/* Show modal */
function showModal() {
    memberModal.style.display = 'flex';
    toggleAvatarInputs(); /* Initialize input visibility */
}

/* Hide modal */
function hideModal() {
    memberModal.style.display = 'none';
    memberNameInput.value = '';
    memberAvatarUrlInput.value = '';
    memberAvatarFileInput.value = '';
    avatarSourceRadios[0].checked = true; /* Reset to URL */
    toggleAvatarInputs();
}

/* Add new team member */
function addMember() {
    const name = memberNameInput.value.trim();
    const selectedSource = document.querySelector('input[name="avatarSource"]:checked').value;

    if (!name) {
        alert('Please provide a member name.');
        return;
    }

    if (selectedSource === 'url') {
        const avatarUrl = memberAvatarUrlInput.value.trim();
        const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i;
        if (!avatarUrl || !urlPattern.test(avatarUrl)) {
            alert('Please provide a valid image URL (e.g., .png, .jpg).');
            return;
        }
        avatars[name] = avatarUrl;
        renderTeamMembers();
        saveTasks();
        hideModal();
    } else {
        const file = memberAvatarFileInput.files[0];
        if (!file) {
            alert('Please select an image file.');
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file (e.g., .png, .jpg).');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { /* 2MB limit */
            alert('Image file size must be less than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            avatars[name] = reader.result; /* Store data URL */
            renderTeamMembers();
            saveTasks();
            hideModal();
        };
        reader.onerror = () => {
            alert('Error reading the image file.');
        };
        reader.readAsDataURL(file);
    }
}

/* Event listeners */
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
addMemberBtn.addEventListener('click', showModal);
saveMemberBtn.addEventListener('click', addMember);
cancelMemberBtn.addEventListener('click', hideModal);
avatarSourceRadios.forEach(radio => radio.addEventListener('change', toggleAvatarInputs));

/* Initial render */
renderTeamMembers();
renderTasks();