let isScrolling = false;
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

document.addEventListener('DOMContentLoaded', function () {
    fetch(`https://${GetParentResourceName()}/getConfig`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }).then(resp => resp.json()).then(config => {
        document.documentElement.style.setProperty('--background-color', config.style.backgroundColor);
        document.documentElement.style.setProperty('--border-color', config.style.borderColor);
        document.documentElement.style.setProperty('--text-color', config.style.textColor);
        document.documentElement.style.setProperty('--glow-color', config.style.glowColor);
    });
    const infobar = document.getElementById('infobar');
    const scrollingText = document.querySelector('.scrolling-text');
    const moveButton = document.getElementById('move-button');

    function scrollMessage(text, scrollSpeed) {
        if (isScrolling) return;
        isScrolling = true;

        scrollingText.style.animation = 'none';
        scrollingText.textContent = text;

        void scrollingText.offsetWidth;

        const contentWidth = scrollingText.offsetWidth;
        const duration = (contentWidth / scrollSpeed) * 1000;

        scrollingText.style.animation = `scrollText ${duration}ms linear infinite`;

        setTimeout(() => {
            isScrolling = false;
            fetch(`https://${GetParentResourceName()}/scrollComplete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({})
            });
        }, duration);
    }

    function toggleMoveMode(state) {
        moveButton.style.display = state ? 'block' : 'none';
        infobar.style.cursor = state ? 'move' : 'default';
        document.body.style.cursor = state ? 'default' : 'none';
    }

    window.addEventListener('message', function (event) {
        if (event.data.type === 'showMessage' && !isScrolling) {
            scrollMessage(event.data.text, event.data.scrollSpeed || 180);
        }
        if (event.data.type === 'toggleMove') {
            toggleMoveMode(event.data.state);
        }
    });

    function dragStart(e) {
        const rect = infobar.getBoundingClientRect();
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;
        if (e.target === infobar || e.target.parentElement === infobar) {
            isDragging = true;
            infobar.style.transition = 'none';
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            infobar.style.left = `${currentX}px`;
            infobar.style.top = `${currentY}px`;
        }
    }

    function dragEnd(e) {
        if (isDragging) {
            isDragging = false;
            infobar.style.transition = 'all 0.3s ease';
        }
    }

    infobar.addEventListener('mousedown', dragStart, false);
    document.addEventListener('mousemove', drag, false);
    document.addEventListener('mouseup', dragEnd, false);
    document.addEventListener('mouseleave', dragEnd, false);

    document.addEventListener('keyup', function(event) {
        if (event.key === 'Escape') {
            toggleMoveMode(false);
            fetch(`https://${GetParentResourceName()}/disableNUI`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
        }
    });
});
