// map.js - Loads Google Maps dynamically and initializes maps

let map;
let marker;
let dashboardMap;
let markers = [];

async function loadGoogleMapsScript(callbackName) {
    try {
        const data = await API.request('/api/config/maps');
        if (!data.apiKey) {
            console.warn("No Google Maps API Key found. Maps functionality will be degraded.");
            return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } catch(e) {
        console.error('Failed to load Google Maps config');
    }
}

// ---------------- REQUEST PAGE MAP LOGIC ----------------
window.initRequestMap = function() {
    const defaultLocation = { lat: 17.437462, lng: 78.448288 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation, zoom: 12
    });
    marker = new google.maps.Marker({
        position: defaultLocation, map: map, draggable: true
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
                (error) => UI.showToast('Unable to fetch location', 'error')
            );
        }
    });

    // Request Form Submit
    document.getElementById('requestForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        UI.setLoading('requestSubmitBtn', true, 'Submit Request');
        
        const requestData = {
            name: document.getElementById('name').value,
            emergencyType: document.getElementById('emergencyType').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            shareLocation: document.getElementById('shareLocation').checked,
            timestamp: new Date().toISOString()
        };

        try {
            await API.request('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            UI.showToast('Emergency request submitted successfully!', 'success');
            document.getElementById('requestForm').reset();
            map.setCenter(defaultLocation);
            marker.setPosition(defaultLocation);
            document.getElementById('location').value = `${defaultLocation.lat},${defaultLocation.lng}`;
        } catch(error) {
            UI.showToast(error.message, 'error');
        } finally {
            UI.setLoading('requestSubmitBtn', false, 'Submit Request');
        }
    });
};

// ---------------- DASHBOARD PAGE MAP LOGIC ----------------
window.initDashboardMaps = function() {
    dashboardMap = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 17.437462, lng: 78.448288 }, zoom: 12
    });
    loadRequests();
};

async function loadRequests() {
    try {
        const requests = await API.request('/api/requests');
        const requestList = document.getElementById('requestList');
        
        if (requests.length === 0) {
            requestList.innerHTML = '<p style="padding:1rem;color:#666;">No active requests yet.</p>';
        } else {
            requestList.innerHTML = requests.map((req, index) => `
                <div data-index="${index}">
                    <h3 style="margin-bottom:0.5rem;color:var(--primary-teal);">${req.emergencyType} - ${req.name}</h3>
                    <p style="font-size:0.9rem;color:#444;">${req.description.substring(0, 50)}...</p>
                </div>
            `).join('');

            requestList.querySelectorAll('div[data-index]').forEach((item, index) => {
                item.addEventListener('click', () => showRequestDetails(requests[index]));
            });

            // Handle Map Markers
            markers.forEach(m => m.setMap(null));
            markers = [];
            
            if(requests.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                requests.forEach(req => {
                    const [lat, lng] = req.location.split(',').map(Number);
                    const position = { lat, lng };
                    const m = new google.maps.Marker({
                        position, map: dashboardMap, title: `${req.emergencyType} - ${req.name}`
                    });
                    m.addListener('click', () => {
                        new google.maps.InfoWindow({ content: `<b>${req.emergencyType}</b><br>${req.description}` }).open(dashboardMap, m);
                    });
                    markers.push(m);
                    bounds.extend(position);
                });
                dashboardMap.fitBounds(bounds);
            }
        }
        
        setupModalListeners();
    } catch(error) {
        UI.showToast('Failed to load requests', 'error');
    }
}

function showRequestDetails(req) {
    const modal = document.getElementById('requestModal');
    const details = document.getElementById('requestDetails');
    details.innerHTML = `
        <p style="margin-bottom:0.5rem;"><strong>Name:</strong> ${req.name}</p>
        <p style="margin-bottom:0.5rem;"><strong>Emergency Type:</strong> ${req.emergencyType}</p>
        <p style="margin-bottom:0.5rem;"><strong>Location:</strong> ${req.location}</p>
        <p style="margin-bottom:0.5rem;"><strong>Description:</strong> ${req.description}</p>
        <p style="margin-bottom:0.5rem;"><strong>Contact:</strong> <a href="tel:${req.phone}">${req.phone}</a> | <a href="mailto:${req.email}">${req.email}</a></p>
        <p style="margin-bottom:0.5rem;"><strong>Time:</strong> ${new Date(req.timestamp).toLocaleString()}</p>
    `;
    modal.style.display = 'flex';

    document.getElementById('acceptRequest').onclick = () => { UI.showToast('Request Accepted', 'success'); modal.style.display = 'none'; };
    document.getElementById('declineRequest').onclick = () => { modal.style.display = 'none'; };
}

function setupModalListeners() {
    const modal = document.getElementById('requestModal');
    document.querySelector('.close')?.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
}

// Bootstrap Maps Based on Page Setup
document.addEventListener('DOMContentLoaded', () => {
    const curScript = document.querySelector('script[src="js/map.js"]');
    if (curScript) {
        if (curScript.dataset.page === 'request') {
            loadGoogleMapsScript('initRequestMap');
        } else if (curScript.dataset.page === 'dashboard') {
            loadGoogleMapsScript('initDashboardMaps');
        }
    }
});
