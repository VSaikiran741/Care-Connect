// auth.js - Handles Login, Signup, Logout

document.addEventListener('DOMContentLoaded', async () => {
    
    // Check Auth State for Protected Pages
    const protectedPages = ['request.html', 'dashboard.html'];
    const authPages = ['login.html', 'signup.html'];
    const currentPath = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPath)) {
        try {
            const data = await API.request('/api/check-auth');
            if (!data.isLoggedIn) {
                window.location.href = 'login.html';
            } else {
                // Populate Dashboard Info if applicable
                if (currentPath === 'dashboard.html' && data.user && data.user.userType === 'volunteer') {
                    const volunteerNameEl = document.getElementById('volunteerName');
                    if (volunteerNameEl) volunteerNameEl.textContent = data.user.username;
                    const profileImgEl = document.getElementById('profileImg');
                    if (profileImgEl) profileImgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.username)}`;
                }
            }
        } catch(e) {
            window.location.href = 'login.html';
        }
    } else if (authPages.includes(currentPath)) {
        // If already logged in, redirect away from login/signup
        const route = await API.getRedirectBasedOnRole();
        if (route) window.location.href = route;
    }

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            UI.setLoading('loginBtn', true);
            const userType = document.getElementById('user-type').value;
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            try {
                const data = await API.request('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (data.userType !== userType) {
                    UI.showToast('Role mismatch. Did you select the correct role?', 'error');
                    UI.setLoading('loginBtn', false, 'Login');
                    return;
                }

                UI.showToast(data.message, 'success');
                setTimeout(() => {
                    window.location.href = data.userType === 'volunteer' ? 'dashboard.html' : 'request.html';
                }, 1000);
            } catch (error) {
                UI.showToast(error.message, 'error');
            } finally {
                UI.setLoading('loginBtn', false, 'Login');
            }
        });
    }

    // Signup Form Submit
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            UI.setLoading('signupBtn', true);
            const userType = document.getElementById('signup-user-type').value;
            const username = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const phone = document.getElementById('signup-phone').value.trim();
            const password = document.getElementById('signup-password').value;

            try {
                const data = await API.request('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userType, username, email, phone, password })
                });
                
                UI.showToast(data.message, 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } catch (error) {
                UI.showToast(error.message, 'error');
            } finally {
                UI.setLoading('signupBtn', false, 'Sign Up');
            }
        });
    }

    // Logout Functionality
    const handleLogout = async () => {
        try {
            const data = await API.request('/api/logout', { method: 'POST' });
            UI.showToast(data.message, 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } catch (error) {
            UI.showToast('Logout failed', 'error');
        }
    };

    document.getElementById('logoutButton')?.addEventListener('click', handleLogout);
    document.getElementById('sidebarLogoutBtn')?.addEventListener('click', handleLogout);
});
