// api.js - Centralized API calls with error handling

const API = {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, options);
            const contentType = response.headers.get("content-type");
            let data = null;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(text || 'Network response was not ok');
            }
            
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            return data;
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    },

    async getRedirectBasedOnRole() {
        try {
            const data = await this.request('/api/check-auth');
            if (data.isLoggedIn) {
                if (data.user.userType === 'volunteer') return 'dashboard.html';
                return 'request.html';
            }
            return null;
        } catch(e) {
            return null;
        }
    }
};

window.API = API;
