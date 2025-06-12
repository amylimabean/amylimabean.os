// Check if user is admin based on URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('edit') === 'true';

document.addEventListener('DOMContentLoaded', () => {
    const adminControls = document.querySelector('.admin-controls');
    const editMode = document.querySelector('.edit-mode');
    const viewMode = document.querySelector('.view-mode');
    const editBtn = document.querySelector('.admin-edit-btn');
    const saveBtn = document.querySelector('.admin-save-btn');
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

    // Show admin controls only for admin
    if (isAdmin) {
        adminControls.style.display = 'block';
    }

    // Function to save custom message to localStorage
    function saveCustomMessage(messageType, title, content, bgColor) {
        const customMessages = JSON.parse(localStorage.getItem('customAwayMessages') || '{}');
        customMessages[messageType] = {
            content: content,
            bgColor: bgColor,
            title: title
        };
        localStorage.setItem('customAwayMessages', JSON.stringify(customMessages));
    }

    // Function to load custom message from localStorage
    function loadCustomMessage(messageType) {
        const customMessages = JSON.parse(localStorage.getItem('customAwayMessages') || '{}');
        return customMessages[messageType];
    }

    // Function to update message display
    function updateMessageDisplay(messageType) {
        const customMessage = loadCustomMessage(messageType);
        if (customMessage) {
            awayText.innerHTML = customMessage.content;
            messageDisplay.style.backgroundColor = customMessage.bgColor;
            titleBarText.textContent = customMessage.title;
        } else {
            // Default messages
            switch(messageType) {
                case 'brb':
                    awayText.innerHTML = 'Be right back!';
                    messageDisplay.style.backgroundColor = '#FFFF00';
                    titleBarText.textContent = 'Be Right Back';
                    break;
                case 'afk':
                    awayText.innerHTML = 'Away from keyboard';
                    messageDisplay.style.backgroundColor = '#FFFF00';
                    titleBarText.textContent = 'Away From Keyboard';
                    break;
                case 'sleep':
                    awayText.innerHTML = 'Sleeping...';
                    messageDisplay.style.backgroundColor = '#FFFF00';
                    titleBarText.textContent = 'Sleeping';
                    break;
                case 'busy':
                    awayText.innerHTML = 'Busy, will respond later';
                    messageDisplay.style.backgroundColor = '#FFFF00';
                    titleBarText.textContent = 'Busy';
                    break;
            }
        }
    }

    // Edit button click handler
    editBtn.addEventListener('click', () => {
        editMode.style.display = 'block';
        viewMode.style.display = 'none';
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        
        // Populate edit fields with current content
        const currentMessageType = messageSelect.value;
        const customMessage = loadCustomMessage(currentMessageType);
        
        editTitle.value = customMessage?.title || titleBarText.textContent;
        editTextarea.innerHTML = awayText.innerHTML;
        
        // Set the background color in edit mode to match the current display
        const currentBgColor = messageDisplay.style.backgroundColor || '#FFFF00';
        editTextarea.style.backgroundColor = currentBgColor;
        messageDisplay.style.backgroundColor = currentBgColor;

        // Make textarea contentEditable and style it
        editTextarea.contentEditable = true;
        editTextarea.style.fontFamily = '"Comic Sans MS", "Comic Sans", cursive';
        editTextarea.style.fontSize = '16px';
        editTextarea.style.lineHeight = '1.6';
        editTextarea.style.textAlign = 'center';
    });

    // Save button click handler
    saveBtn.addEventListener('click', () => {
        const messageType = messageSelect.value;
        const newTitle = editTitle.value.trim() || titleBarText.textContent;
        const newContentHTML = editTextarea.innerHTML;
        const newBgColor = editTextarea.style.backgroundColor;
        
        // Save the custom message to localStorage for instant preview
        saveCustomMessage(
            messageType,
            newTitle,
            newContentHTML,
            newBgColor
        );

        // Update the display
        titleBarText.textContent = newTitle;
        updateMessageDisplay(messageType);
        
        // Switch back to view mode
        editMode.style.display = 'none';
        viewMode.style.display = 'block';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';

        // --- Generate and show the code to copy ---
        const codeToCopy = `
<!-- Start of Away Message Content -->
<div class="window-content aim-away-message-content">
    <div class="view-mode">
        <div class="aim-message-display" style="background-color: ${newBgColor};">
            <p class="aim-away-text">${newContentHTML}</p>
        </div>
    </div>
    <div class="edit-mode" style="display: none;">
        <!-- Edit controls remain for admin view -->
        <input type="text" class="edit-title" value="${newTitle}">
        <div class="edit-toolbar">
            <button class="format-btn" data-format="bold"><b>B</b></button>
            <button class="format-btn" data-format="italic"><i>I</i></button>
            <button class="format-btn" data-format="underline"><u>U</u></button>
            <select class="color-select">
                <option value="">Color</option>
                <option value="#FF0000" style="color:#FF0000;">Red</option>
                <option value="#0000FF" style="color:#0000FF;">Blue</option>
                <option value="#008000" style="color:#008000;">Green</option>
            </select>
            <select class="bg-color-select">
                <option value="">BG</option>
                <option value="#FFFF00">Yellow</option>
                <option value="#E0DCD3">Gray</option>
                <option value="#FFFFFF">White</option>
            </select>
        </div>
        <div class="edit-textarea" contenteditable="true" style="background-color: ${newBgColor};">${newContentHTML}</div>
    </div>
    <div class="admin-controls" style="display: block;">
        <select id="away-message-select" class="aim-select">
            <option value="brb" ${messageType === 'brb' ? 'selected' : ''}>Be Right Back</option>
            <option value="afk" ${messageType === 'afk' ? 'selected' : ''}>Away From Keyboard</option>
            <option value="sleep" ${messageType === 'sleep' ? 'selected' : ''}>Sleeping</option>
            <option value="busy" ${messageType === 'busy' ? 'selected' : ''}>Busy</option>
        </select>
        <button class="admin-edit-btn">Edit</button>
        <button class="admin-save-btn" style="display: none;">Save</button>
    </div>
</div>
<!-- End of Away Message Content -->
        `;
        
        codeOutputContainer.innerHTML = `
            <h3>Update successful!</h3>
            <p>Your message is saved for you to preview. To make it live for everyone, copy the code below and send it to me:</p>
            <textarea readonly>${codeToCopy.trim()}</textarea>
        `;
        codeOutputContainer.style.display = 'block';

    });

    // Message select change handler
    messageSelect.addEventListener('change', () => {
        updateMessageDisplay(messageSelect.value);
    });

    // Format button click handlers
    formatBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const format = btn.dataset.format;
            document.execCommand(format, false, null);
            editTextarea.focus();
        });
    });

    // Color select handler
    colorSelect.addEventListener('change', (e) => {
        e.preventDefault();
        if (colorSelect.value) {
            document.execCommand('foreColor', false, colorSelect.value);
            editTextarea.focus();
        }
    });

    // Background color select handler
    bgColorSelect.addEventListener('change', () => {
        if (bgColorSelect.value) {
            const newColor = bgColorSelect.value;
            messageDisplay.style.backgroundColor = newColor;
            editTextarea.style.backgroundColor = newColor;
        }
    });

    // Add keyboard shortcuts for formatting
    editTextarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    document.execCommand('bold', false, null);
                    break;
                case 'i':
                    e.preventDefault();
                    document.execCommand('italic', false, null);
                    break;
                case 'u':
                    e.preventDefault();
                    document.execCommand('underline', false, null);
                    break;
            }
        }
    });

    // Initialize with the current selection
    updateMessageDisplay(messageSelect.value);
}); 