// ui.js - Handles UI elements like Toasts and Loading states

const UI = {
    showToast: (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerText = message;
        
        container.appendChild(toast);
        
        // Trigger reflow for animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    setLoading: (buttonId, isLoading, originalText = 'Submit') => {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        
        if (isLoading) {
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner"></span> Loading...`;
        } else {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
};

window.UI = UI;
