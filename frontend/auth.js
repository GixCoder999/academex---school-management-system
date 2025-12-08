

async function checkLogin() {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
        alert('You are not logged in. Redirecting to login page.');
        window.location.href = 'signin_real.html';
        return;
    }
    const response = await fetch(`${API_BASE}/validateToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    });
    const data = await response.json(); 
    if (!data.valid) {
        sessionStorage.removeItem('authToken');
        alert('Unauthorized Access! Redirecting to login page.');
        window.location.href = 'signin_real.html';
    }
    else {
        console.log('Token is valid. Access granted.');
        return true;
    }
}

//export { checkLogin };