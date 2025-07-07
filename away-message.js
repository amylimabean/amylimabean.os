document.addEventListener('DOMContentLoaded', () => {
    const awayMessages = [
        {
            title: "UGH, MOM!",
            image: "assets/away messages/UGH, MOM!.png"
        },
        {
            title: "dnt txt",
            image: "assets/away messages/dnt txt.png"
        },
        {
            title: "outtie_3",
            image: "assets/away messages/outtie_3.png"
        },
        {
            title: "wtevr..",
            image: "assets/away messages/wtevr..png"
        }
    ];

    const awayWindow = document.getElementById('window-vacation');
    if (!awayWindow) return;

    const awayMessageSelect = document.getElementById('away-message-select');
    const aimMessageDisplay = awayWindow.querySelector('.aim-message-display');
    const viewMode = awayWindow.querySelector('.view-mode');
    const editMode = awayWindow.querySelector('.edit-mode');
    const editTitleInput = awayWindow.querySelector('.edit-title');
    const editTextarea = awayWindow.querySelector('.edit-textarea');
    const adminControls = awayWindow.querySelector('.admin-controls');
    const editBtn = awayWindow.querySelector('.admin-edit-btn');
    const saveBtn = awayWindow.querySelector('.admin-save-btn');
    
    let currentIndex = 0;

    function populateAwayMessageSelect() {
        if (awayMessageSelect) {
            awayMessageSelect.innerHTML = '';
            awayMessages.forEach((msg, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = msg.title;
                awayMessageSelect.appendChild(option);
            });
            awayMessageSelect.value = currentIndex;
        }
    }

    function showAwayMessage(index) {
        if (index >= 0 && index < awayMessages.length) {
            currentIndex = index;
            const message = awayMessages[index];
            if (aimMessageDisplay) {
                aimMessageDisplay.innerHTML = `<img src="${message.image}" alt="${message.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
            }
            if (editTitleInput) {
                editTitleInput.value = message.title;
            }
            if (editTextarea) {
                 editTextarea.innerHTML = `<img src="${message.image}" alt="${message.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
            }
        }
    }
    
    function saveEditedMessage() {
        const newTitle = editTitleInput.value.trim();
        if (newTitle && currentIndex >= 0 && currentIndex < awayMessages.length) {
            awayMessages[currentIndex].title = newTitle;
            // In a real application, you would handle image uploads here.
            // For now, we are only allowing title edits.
            populateAwayMessageSelect();
            showAwayMessage(currentIndex);
        }
        
        if (viewMode && editMode && editBtn && saveBtn) {
            viewMode.style.display = 'flex';
            editMode.style.display = 'none';
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        }
    }

    if (awayMessageSelect) {
        awayMessageSelect.addEventListener('change', (e) => {
            showAwayMessage(parseInt(e.target.value, 10));
        });
    }

    if(editBtn && saveBtn && viewMode && editMode) {
        editBtn.addEventListener('click', () => {
            viewMode.style.display = 'none';
            editMode.style.display = 'block';
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
        });

        saveBtn.addEventListener('click', saveEditedMessage);
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('admin') && adminControls) {
        adminControls.style.display = 'flex';
    }

    populateAwayMessageSelect();
    if (awayMessages.length > 0) {
        showAwayMessage(0);
    }
});
