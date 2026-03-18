// Debug: Confirm script.js is loaded
console.log('script.js loaded');

// Check if user is logged in
async function checkAuth() {
    const response = await fetch('/api/check-auth');
    const data = await response.json();
    const currentPage = window.location.pathname.split('/').pop();

    const protectedPages = ['request.html', 'dashboard.html'];
    if (protectedPages.includes(currentPage) && !data.isLoggedIn) {
        alert('Please login to access this page.');
        window.location.href = 'index.html#login';
    }
}

// Run auth check on page load
checkAuth();

// Section Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Handle navigation links
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    // Handle "Get Help Now" button to show Login section
    document.querySelector('.button-group button:nth-child(2)')?.addEventListener('click', () => {
        showSection('login');
    });

    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        console.log('Signup form found');
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Signup form submitted');
            const userType = document.getElementById('signup-user-type').value;
            const username = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const phone = document.getElementById('signup-phone').value;
            const password = document.getElementById('signup-password').value;

            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userType, username, email, phone, password })
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    showSection('login');
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('An error occurred during signup.');
            }
        });
    } else {
        console.log('Signup form NOT found');
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Login form submitted');
            const userType = document.getElementById('user-type').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    if (userType === 'volunteer') {
                        window.location.href = 'dashboard.html';
                    } else {
                        window.location.href = 'request.html';
                    }
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login.');
            }
        });
    } else {
        console.log('Login form NOT found');
    }
});

// Logout Functionality
document.getElementById('logoutButton')?.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        const data = await response.json();
        alert(data.message);
        window.location.href = 'index.html#login';
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
    }
});

document.querySelector('.sidebar')?.addEventListener('click', async (e) => {
    if (e.target.classList.contains('nav-item') && e.target.dataset.panel === 'settings') {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            });
            const data = await response.json();
            alert(data.message);
            window.location.href = 'index.html#login';
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout.');
        }
    }
});

// Google Maps for Request Form
let map;
let marker;

function initMap() {
    const defaultLocation = { lat: 17.437462, lng: 78.448288};
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 12
    });
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true
    });

    marker.addListener('dragend', () => {
        const position = marker.getPosition();
        document.getElementById('location').value = `${position.lat()},${position.lng()}`;
    });

    document.getElementById('location').value = `${defaultLocation.lat},${defaultLocation.lng}`;

    document.getElementById('gpsButton')?.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPosition = { lat: latitude, lng: longitude };
                    map.setCenter(newPosition);
                    marker.setPosition(newPosition);
                    document.getElementById('location').value = `${latitude},${longitude}`;
                },
                (error) => {
                    console.error('Error fetching location:', error);
                    alert('Unable to fetch your location. Please allow location access or enter it manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });
}

// Emergency Request Form
document.getElementById('requestForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const requestData = {
        name: document.getElementById('name').value,
        emergencyType: document.getElementById('emergencyType').value,
        location: document.getElementById('location').value,
        description: document.getElementById('description').value,
        shareLocation: document.getElementById('shareLocation').checked,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            alert('Emergency request submitted successfully!');
            document.getElementById('requestForm').reset();
            const defaultLocation = {lat: 17.437462, lng: 78.448288};
            map.setCenter(defaultLocation);
            marker.setPosition(defaultLocation);
            document.getElementById('location').value = `${defaultLocation.lat},${defaultLocation.lng}`;
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to submit request. Try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});

// Volunteer Dashboard Functionality
let dashboardMap;
let markers = [];

function initDashboardMaps() {
    const defaultLocation = { lat: 17.437462, lng: 78.448288 };
    dashboardMap = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 12
    });

    loadRequests();

    fetch('/api/check-auth')
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                document.getElementById('volunteerName').textContent = data.user.username;
                document.querySelector('.profile-image img').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.username)}`;
            }
        });
}

async function loadRequests() {
    try {
        const response = await fetch('/api/requests');
        const requests = await response.json();
        const requestList = document.getElementById('requestList');
        
        if (requests.length === 0) {
            requestList.innerHTML = '<p>No active requests yet.</p>';
        } else {
            requestList.innerHTML = requests.map((req, index) => `
                <div data-index="${index}">
                    <h3>${req.emergencyType} - ${req.name}</h3>
                    <p>${req.description}</p>
                </div>
            `).join('');

            requestList.querySelectorAll('div').forEach((item, index) => {
                item.addEventListener('click', () => showRequestDetails(requests[index]));
    // Close modal when clicking the close button
document.querySelector('.close')?.addEventListener('click', () => {
    const modal = document.getElementById('requestModal');
    if (modal) {
        modal.style.display = 'none';
    }
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (e) => {
    const modal = document.getElementById('requestModal');
    const modalContent = document.querySelector('.modal-content');
    if (modal && modalContent && e.target === modal) {
        modal.style.display = 'none';
    }
});
        });

            markers.forEach(marker => marker.setMap(null));
            markers = [];

            const bounds = new google.maps.LatLngBounds();
            requests.forEach(req => {
                const [lat, lng] = req.location.split(',').map(Number);
                const position = { lat, lng };
                const marker = new google.maps.Marker({
                    position: position,
                    map: dashboardMap,
                    title: `${req.emergencyType} - ${req.name}`
                });
                marker.addListener('click', () => {
                    new google.maps.InfoWindow({
                        content: `<b>${req.emergencyType} - ${req.name}</b><br>${req.description}`
                    }).open(dashboardMap, marker);
                });
                markers.push(marker);
                bounds.extend(position);
            });

            if (markers.length > 0) {
                dashboardMap.fitBounds(bounds);
            }
        }
    } catch (error) {
        console.error('Error fetching requests:', error);
    }
}

function showRequestDetails(req) {
    const modal = document.getElementById('requestModal');
    const details = document.getElementById('requestDetails');
    details.innerHTML = `
        <p><strong>Name:</strong> ${req.name}</p>
        <p><strong>Emergency Type:</strong> ${req.emergencyType}</p>
        <p><strong>Location:</strong> ${req.location}</p>
        <p><strong>Description:</strong> ${req.description}</p>
        <p><strong>Contact:</strong> ${req.email} | ${req.phone}</p>
        <p><strong>Timestamp:</strong> ${new Date(req.timestamp).toLocaleString()}</p>
        <p><strong>Live Location Sharing:</strong> ${req.shareLocation ? 'Enabled' : 'Disabled'}</p>
    `;
    modal.style.display = 'flex';

    //  Accept and Decline Button Logic
    document.getElementById('acceptRequest').onclick = function() {
        alert('Request Accepted');
        modal.style.display = 'none';
    };

    document.getElementById('declineRequest').onclick = function() {
        alert('Request Declined');
        modal.style.display = 'none';
    };
}