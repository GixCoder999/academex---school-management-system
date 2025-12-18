
const username = sessionStorage.getItem("username");
const newPassword = document.getElementById('new-password');
const confirmPassword = document.getElementById('confirm-password');

const API_BASE = 'https://academex-school-management-system-production.up.railway.app';




async function setPassword()
{
	
	const passwordValue = newPassword.value 
    const CpasswordValue = confirmPassword.value

    if (!passwordValue.trim() || !CpasswordValue.trim())
    {
    alert('Please fill in both password fields');
    return;
    }

    if(passwordValue.length < 8  || CpasswordValue.length < 8) 
    {
	alert('Password must be atleast 8 characters long');
	return;
    }
	if(passwordValue !== CpasswordValue)
    {
        alert('Passwords dont match Please re-enter');
        return ;
    }
	try
	{
		const response = await fetch(`${API_BASE}/resetpassword` , 
		{
    
			method: 'POST' , 
			headers:{'Content-Type': 'application/json'} , 
			body: JSON.stringify({username: username , password: passwordValue})
		});
		const result = await response.json();
		
		if(result.success)
		{ 
		   alert(result.message); 
		   sessionStorage.removeItem('username');
		   sessionStorage.removeItem('authToken');
		   sessionStorage.removeItem('profilePicPath');
		   sessionStorage.removeItem('role');
		   window.location.href = '../index.html' ;
           return;
		}
		alert(result.message);		
	}
	catch(error)
	{
		alert('Internal Server Error Please try again');
	}
}

document.getElementById('submit-btn').addEventListener('click', function(event) {
    event.preventDefault(); 
    setPassword();
});