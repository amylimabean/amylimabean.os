const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('edit') === 'true';

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const adminControls = document.querySelector('.admin-controls');
    const editMode = document.querySelector('.edit-mode');
    const viewMode = document.querySelector('.view-mode');
    const editBtn = document.querySelector('.admin-edit-btn');
    const saveBtn = document.querySelector('.admin-save-btn');
    const newBtn = document.querySelector('.admin-new-btn');
    const deleteBtn = document.querySelector('.admin-delete-btn');
    const formatBtns = document.querySelectorAll('.format-btn');
    const colorSelect = document.querySelector('.color-select');
    const bgColorSelect = document.querySelector('.bg-color-select');
    const editTitle = document.querySelector('.edit-title');
    const editTextarea = document.querySelector('.edit-textarea');
    const messageDisplay = document.querySelector('.aim-message-display');
    const awayText = document.querySelector('.aim-away-text');
    const messageSelect = document.querySelector('#away-message-select');
    const titleBarText = document.querySelector('#window-vacation .title-bar-text');
    
    const codeOutputContainer = document.createElement('div');
    codeOutputContainer.className = 'code-output-container';
    codeOutputContainer.style.display = 'none';
    const vacationWindowContent = document.querySelector('#window-vacation .window-content');
    if (vacationWindowContent) {
        vacationWindowContent.appendChild(codeOutputContainer);
    }
    
    // --- Initial State and Data ---
    let awayMessages = {
        brb: { title: 'Be Right Back', content: 'Be right back!', bgColor: '#FFFF00' },
        dnttxt: { title: 'dnt txt', content: 'dnt txt', bgColor: '#FFFF00'},
        sleep: { title: 'Sleeping', content: 'Sleeping...', bgColor: '#FFFF00' },
        busy: { title: 'Busy', content: 'Busy, will respond later', bgColor: '#FFFF00' }
    };

    function loadMessages() {
        const storedMessages = localStorage.getItem('customAwayMessages');
        if (storedMessages) {
            const loadedMessages = JSON.parse(storedMessages);

            // Force a reset if old data is detected.
            const hasOldMessages = Object.values(loadedMessages).some(
                msg => msg.title === 'brb crying' || msg.title === 'Away From Keyboard'
            );

            if (hasOldMessages) {
                localStorage.removeItem('customAwayMessages');
                // Use the default awayMessages object by not assigning loadedMessages
            } else {
                 awayMessages = loadedMessages;
            }
        }
    }
    
    function saveAllMessages() {
        localStorage.setItem('customAwayMessages', JSON.stringify(awayMessages));
    }

    // --- Core Functions ---
    function populateDropdown() {
        const selectedValue = messageSelect.value;
        messageSelect.innerHTML = '';
        for (const key in awayMessages) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = awayMessages[key].title;
            messageSelect.appendChild(option);
        }
        messageSelect.value = selectedValue && awayMessages[selectedValue] ? selectedValue : Object.keys(awayMessages)[0];
        updateMessageDisplay();
    }

    function updateMessageDisplay() {
        const selectedKey = messageSelect.value;
        const message = awayMessages[selectedKey];
        if (message) {
            awayText.innerHTML = message.content;
            messageDisplay.style.backgroundColor = message.bgColor;
            titleBarText.textContent = `Away Message - ${message.title}`;
        } else if (Object.keys(awayMessages).length > 0) {
            // If selected key is invalid, show first message
            messageSelect.value = Object.keys(awayMessages)[0];
            updateMessageDisplay();
        } else {
            // No messages exist
            awayText.innerHTML = 'No messages available.';
            messageDisplay.style.backgroundColor = '#E0E0E0';
            titleBarText.textContent = 'Away Message';
        }
    }

    // --- Admin Mode Setup ---
    if (isAdmin) {
        adminControls.style.display = 'flex';
    }

    // --- Event Listeners ---
    editBtn.addEventListener('click', () => {
        const selectedKey = messageSelect.value;
        const message = awayMessages[selectedKey];
        if (!message) return;

        editMode.style.display = 'flex';
        viewMode.style.display = 'none';
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        
        editTitle.value = message.title;
        editTextarea.innerHTML = message.content;
        editTextarea.style.backgroundColor = message.bgColor;
        messageDisplay.style.backgroundColor = message.bgColor; // Keep bg color consistent

        codeOutputContainer.style.display = 'none';
    });

    saveBtn.addEventListener('click', () => {
        const selectedKey = messageSelect.value;
        if (!awayMessages[selectedKey]) return;

        const newTitle = editTitle.value.trim();
        const newContentHTML = editTextarea.innerHTML;
        const newBgColor = editTextarea.style.backgroundColor;

        // Update the message object
        awayMessages[selectedKey] = {
            title: newTitle,
            content: newContentHTML,
            bgColor: newBgColor
        };
        
        saveAllMessages();
        populateDropdown(); // Repopulate to reflect title change
        updateMessageDisplay();
        
        editMode.style.display = 'none';
        viewMode.style.display = 'block';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        
        generateCodeForCopying();
    });
    
    newBtn.addEventListener('click', () => {
        const newKey = prompt("Enter a short, one-word key for the new message (e.g., 'lunch'):");
        if (newKey && !awayMessages[newKey]) {
            const key = newKey.trim().toLowerCase().replace(/\s+/g, '-');
            awayMessages[key] = { title: 'New Message', content: '...', bgColor: '#FFFFFF' };
            saveAllMessages();
            populateDropdown();
            messageSelect.value = key; // Select the new message
            updateMessageDisplay();
            editBtn.click(); // Immediately go into edit mode
        } else if (awayMessages[newKey]) {
            alert('A message with this key already exists.');
        }
    });

    deleteBtn.addEventListener('click', () => {
        const selectedKey = messageSelect.value;
        if (Object.keys(awayMessages).length <= 1) {
            alert("You can't delete the last message!");
            return;
        }
        if (confirm(`Are you sure you want to delete the "${awayMessages[selectedKey].title}" message?`)) {
            delete awayMessages[selectedKey];
            saveAllMessages();
            populateDropdown();
            updateMessageDisplay();
            generateCodeForCopying();
        }
    });

    messageSelect.addEventListener('change', updateMessageDisplay);

    function generateCodeForCopying() {
        let optionsHTML = '';
        for (const key in awayMessages) {
            const msg = awayMessages[key];
            optionsHTML += `<option value="${key}">${msg.title}</option>`;
        }
        
        const firstMessageKey = Object.keys(awayMessages)[0];
        const firstMessage = awayMessages[firstMessageKey];

        const codeToCopy = `
<!-- Start of Away Message Content -->
<div class="window-content aim-away-message-content">
    <select id="away-message-select" class="aim-select">
        ${optionsHTML.trim()}
    </select>
    <div class="view-mode">
        <div class="aim-message-display" style="background-color: ${firstMessage.bgColor};">
            <p class="aim-away-text">${firstMessage.content}</p>
        </div>
    </div>
    <div class="edit-mode" style="display: none;">
        <!-- ... Full edit controls structure ... -->
    </div>
    <div class="admin-controls" style="display: none;">
        <button class="admin-edit-btn">Edit</button>
        <button class="admin-save-btn" style="display: none;">Save</button>
        <button class="admin-new-btn">New</button>
        <button class="admin-delete-btn">Delete</button>
    </div>
</div>
<script>
    // This inline script is now required to handle the initial state
    document.addEventListener('DOMContentLoaded', () => {
        const awayMessagesData = ${JSON.stringify(awayMessages, null, 2)};
        const messageSelect = document.querySelector('#away-message-select');
        const awayText = document.querySelector('.aim-away-text');
        const messageDisplay = document.querySelector('.aim-message-display');
        const titleBarText = document.querySelector('#window-vacation .title-bar-text');

        messageSelect.addEventListener('change', () => {
            const selectedKey = messageSelect.value;
            const message = awayMessagesData[selectedKey];
            if (message) {
                awayText.innerHTML = message.content;
                messageDisplay.style.backgroundColor = message.bgColor;
                titleBarText.textContent = 'Away Message - ' + message.title;
            }
        });
        
        // Set initial state
        const initialKey = messageSelect.value;
        if (awayMessagesData[initialKey]) {
            awayText.innerHTML = awayMessagesData[initialKey].content;
            messageDisplay.style.backgroundColor = awayMessagesData[initialKey].bgColor;
            titleBarText.textContent = 'Away Message - ' + awayMessagesData[initialKey].title;
        }
    });
<\/script>
<!-- End of Away Message Content -->
        `;
        
        codeOutputContainer.innerHTML = `
            <h3>Update successful!</h3>
            <p>To make this live for everyone, copy ALL the code below and send it to me. This will replace the entire away message window.</p>
            <textarea readonly>${codeToCopy.trim()}</textarea>
        `;
        codeOutputContainer.style.display = 'block';
    }

    // --- Rich Text Editor Logic (unchanged) ---
    formatBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const format = btn.dataset.format;
            document.execCommand(format, false, null);
            editTextarea.focus();
        });
    });

    colorSelect.addEventListener('change', (e) => {
        e.preventDefault();
        if (colorSelect.value) {
            document.execCommand('foreColor', false, colorSelect.value);
            editTextarea.focus();
        }
    });

    bgColorSelect.addEventListener('change', () => {
        if (bgColorSelect.value) {
            const newColor = bgColorSelect.value;
            messageDisplay.style.backgroundColor = newColor;
            editTextarea.style.backgroundColor = newColor;
        }
    });

    editTextarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b': e.preventDefault(); document.execCommand('bold'); break;
                case 'i': e.preventDefault(); document.execCommand('italic'); break;
                case 'u': e.preventDefault(); document.execCommand('underline'); break;
            }
        }
    });

    // --- Initial Load ---
    loadMessages();
    populateDropdown();
    updateMessageDisplay();
}); 