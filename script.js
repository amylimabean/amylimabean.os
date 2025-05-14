// script.js
// This file is for any future JavaScript enhancements.
// For now, it's intentionally left minimal for this simple prototype.

// Example of a very simple interaction (optional):
// document.addEventListener('DOMContentLoaded', () => {
//     const profileName = document.querySelector('.profile-name h1');
//     if (profileName) {
//         profileName.addEventListener('click', () => {
//             alert('You clicked my name! Thanks for visiting my MySpace... I mean, portfolio!');
//         });
//     }
// }); 

document.addEventListener('DOMContentLoaded', () => {
    const desktopArea = document.querySelector('.desktop-area');
    const icons = document.querySelectorAll('.desktop-icon');
    const windows = document.querySelectorAll('.window');
    let highestZIndex = 100; // Initial z-index for windows
    let highestIconZIndex = 10; // Initial z-index for icons
    let iconsInitializedAbsolute = false; // Flag to track if icons have been 'snapshotted'

    function bringToFront(windowElement) {
        highestZIndex++;
        windowElement.style.zIndex = highestZIndex;
    }

    // --- Window Functionality (Dragging, Closing, Focusing) ---
    windows.forEach(win => {
        const titleBar = win.querySelector('.title-bar');
        const closeButton = win.querySelector('.title-bar-buttons .close');

        win.addEventListener('mousedown', () => {
            bringToFront(win);
        });

        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                win.style.display = 'none';
            });
        }

        if (titleBar) {
            titleBar.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('button')) {
                    return;
                }
                bringToFront(win);
                win.isDragging = true;
                win.offsetX = e.clientX - win.offsetLeft;
                win.offsetY = e.clientY - win.offsetTop;
                titleBar.style.cursor = 'grabbing';
            });
        }
    });

    // --- Desktop Icon Click & Drag Functionality ---
    icons.forEach(iconToDrag => {
        iconToDrag.addEventListener('mousedown', (e) => {
            highestIconZIndex++;
            iconToDrag.style.zIndex = highestIconZIndex;
            
            if (e.detail === 1) { 
                if (!iconsInitializedAbsolute) {
                    const initialPositions = [];
                    const desktopRect = desktopArea.getBoundingClientRect();

                    icons.forEach(iconInFlex => {
                        if (getComputedStyle(iconInFlex).position !== 'absolute') {
                            const iconRect = iconInFlex.getBoundingClientRect();
                            initialPositions.push({
                                element: iconInFlex,
                                left: iconRect.left - desktopRect.left,
                                top: iconRect.top - desktopRect.top
                            });
                        }
                    });

                    initialPositions.forEach(pos => {
                        pos.element.style.position = 'absolute';
                        pos.element.style.left = pos.left + 'px';
                        pos.element.style.top = pos.top + 'px';
                    });
                    
                    iconsInitializedAbsolute = true;
                }

                iconToDrag.isDragging = true;
                iconToDrag.style.cursor = 'grabbing';
                
                iconToDrag.offsetX = e.clientX - parseFloat(iconToDrag.style.left);
                iconToDrag.offsetY = e.clientY - parseFloat(iconToDrag.style.top);
            }
        });

        iconToDrag.addEventListener('dblclick', () => {
            const windowId = iconToDrag.id.replace('icon-', 'window-');
            const targetWindow = document.getElementById(windowId);
            if (targetWindow) {
                targetWindow.style.display = 'flex';
                bringToFront(targetWindow);
            }
        });

        iconToDrag.addEventListener('click', (e) => {
            if (e.detail === 1) { 
                const windowId = iconToDrag.id.replace('icon-', 'window-');
                const targetWindow = document.getElementById(windowId);
                if (targetWindow && targetWindow.style.display === 'flex') {
                    bringToFront(targetWindow);
                }
            }
        });
    });

    // Global mouse move for dragging windows and icons
    document.addEventListener('mousemove', (e) => {
        windows.forEach(win => {
            if (win.isDragging) {
                let newX = e.clientX - win.offsetX;
                let newY = e.clientY - win.offsetY;
                const desktopRect = desktopArea.getBoundingClientRect();
                const menubarHeight = document.querySelector('.menubar').offsetHeight;
                newX = Math.max(0, Math.min(newX, desktopRect.width - win.offsetWidth));
                newY = Math.max(0, Math.min(newY, desktopRect.height - win.offsetHeight));
                win.style.left = newX + 'px';
                win.style.top = newY + 'px';
            }
        });
        icons.forEach(icon => {
            if (icon.isDragging) {
                let newX = e.clientX - icon.offsetX;
                let newY = e.clientY - icon.offsetY;
                const desktopRect = desktopArea.getBoundingClientRect();
                newX = Math.max(0, Math.min(newX, desktopRect.width - icon.offsetWidth));
                newY = Math.max(0, Math.min(newY, desktopRect.height - icon.offsetHeight));
                icon.style.left = newX + 'px';
                icon.style.top = newY + 'px';
            }
        });
    });

    // Global mouse up to stop dragging
    document.addEventListener('mouseup', () => {
        windows.forEach(win => {
            if (win.isDragging) {
                win.isDragging = false;
                const titleBar = win.querySelector('.title-bar');
                if (titleBar) titleBar.style.cursor = 'grab';
            }
        });
        icons.forEach(icon => {
            if (icon.isDragging) {
                icon.isDragging = false;
                icon.style.cursor = 'grab';
            }
        });
    });

    // --- Update Clock in Menubar ---
    const timeDisplay = document.querySelector('#menu-time');
    function updateClock() {
        if (timeDisplay) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const dayName = days[now.getDay()];
            const dayOfMonth = String(now.getDate()).padStart(2, '0');
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const monthName = months[now.getMonth()];
            const year = now.getFullYear();
            timeDisplay.textContent = `${hours}:${minutes} ${dayName} ${dayOfMonth} ${monthName} ${year}`;
        }
    }
    updateClock();
    setInterval(updateClock, 10000);

    // Ensure profile window is displayed correctly
    const welcomeWindow = document.getElementById('window-welcome');
    if (welcomeWindow) {
        welcomeWindow.style.display = 'flex';
        bringToFront(welcomeWindow);
    }
    // Ensure other windows are hidden initially
    windows.forEach(win => {
        if (win.id !== 'window-welcome') {
            if (!win.style.display || win.style.display !== 'none') {
                 // Check if it has an inline style for display:none from HTML already
                let initiallyHiddenByHTML = false;
                for(let i=0; i < win.attributes.length; i++){
                    if(win.attributes[i].name === 'style' && win.attributes[i].value.includes('display: none')){
                        initiallyHiddenByHTML = true;
                        break;
                    }
                }
                if(!initiallyHiddenByHTML){
                    win.style.display = 'none';
                }
            }
        }
    });
}); 