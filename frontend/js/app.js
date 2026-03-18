// Generic app scripts (e.g. for landing page dynamic links)
document.addEventListener('DOMContentLoaded', async () => {
    // Determine dynamic dashboard link based on auth role
    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
        const route = await API.getRedirectBasedOnRole();
        if (route) {
            dashboardLink.classList.remove('hidden');
            dashboardLink.href = route;
        }
    }
});
