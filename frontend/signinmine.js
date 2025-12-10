const API_BASE = 'https://academex-school-management-system-production.up.railway.app';

function Alert(text, type = 'S') {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'alert-overlay';
        
        // Create await Alert box
        const alertBox = document.createElement('div');
        alertBox.className = 'alert-box';
        
        // Text
        const textElement = document.createElement('div');
        textElement.className = 'alert-text';
        textElement.textContent = text;

        // Buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'alert-buttons';

        // OK button
        const okButton = document.createElement('button');
        okButton.className = 'alert-button ok';
        okButton.textContent = 'OK';

        // CANCEL button (only for confirmation)
        let cancelButton = null;

        // Append OK button always
        buttonsContainer.appendChild(okButton);

        // For confirmation await Alert
        if (type.toUpperCase() === 'C') {
            cancelButton = document.createElement('button');
            cancelButton.className = 'alert-button cancel';
            cancelButton.textContent = 'Cancel';
            buttonsContainer.appendChild(cancelButton);
        }

        // Remove await Alert
        const removeAlert = () => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        };

        // Handle clicks
        okButton.onclick = () => {
            removeAlert();
            resolve(true);
        };

        if (cancelButton) {
            cancelButton.onclick = () => {
                removeAlert();
                resolve(false);
            };
        }

        // Build
        alertBox.appendChild(textElement);
        alertBox.appendChild(buttonsContainer);
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
    });
}


function isValidPassword() {
    const password = document.getElementById("password").value;

    if (password.length < 8) return false;

    return true;
}

async function signin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const credentials = {
        u:username,
        p:password
    }

    if (isValidPassword()) {
        try {
            const response = await fetch(`${API_BASE}/signin`,{
                method:'POST',  
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const msg = await response.json();
            if (msg.success) {
                await Alert('Successful Login!');
                sessionStorage.setItem('authToken', msg.token);
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('role', msg.role);
                sessionStorage.setItem('username',username);
                const result = await getImg(username);
                sessionStorage.setItem('profilePicPath', result);
                console.log(result);
                console.log(sessionStorage.getItem('profilePicPath'));
                if (msg.role=='admin')    window.location.href = 'admin_dashboard.html';
                else if (msg.role=='teacher') {
                    window.location.href = 'teacher_dashboard.html';

                    //sessionStorage.setItem(teacherData);
                }
                else if (msg.role=='student') window.location.href = 'student_dashboard.html';
            }
            else {
                console.log(msg.message);
                await Alert('Something went wrong. Please try again later');
            }
        }
        catch (err) {
            console.log(err);
            await Alert('Error sending request');
        }
    }
    else {
        await Alert('Password must be 8 characters long');
    }
}

document.getElementById("login-btn").addEventListener('click',()=>{
    signin();
});

function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

async function getImg(username) {
    try {
        const response = await fetch(`${API_BASE}/getProfilePic?name=${username}`);
        const data = await response.json(); //problem is here
        console.log('Data: ',data);
        profilePicPath = data.path; //or here
        console.log(profilePicPath); //coz this logs undefined
        return profilePicPath;
    }
    catch(err) {
        console.log(err);
        //alert('Error fetching profile picture');
        return null;
    }
}