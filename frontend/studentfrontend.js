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

async function checkLogin() {
    try {
        const token = sessionStorage.getItem('authToken');
        const role = sessionStorage.getItem('role');
        if (!token || role !== 'student') {
            await Alert('You are not logged in. Redirecting to login page.');
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
            await Alert('Unauthorized Access! Redirecting to login page.');
            window.location.href = 'signin_real.html';
        }
        else {
            sessionStorage.setItem('authToken', token);
            //sessionStorage.setItem('isLoggedIn', 'true');
            console.log('Token is valid. Access granted.');
        }
    }
    catch (err) {
        console.log(err);
        await Alert('Error validating token. Redirecting to login page.');
        window.location.href = 'signin_real.html';
    }
}

function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true' && sessionStorage.getItem('role') === 'student';
}

function logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('profilePicPath');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('visited');
    window.location.href = 'signin_real.html';
}

function setStdImg() {
    const pfp = sessionStorage.getItem("profilePicPath");

    document.getElementById("std-pfp").src = `${API_BASE}/${pfp}`;
}

checkLogin();
setStdImg();
// Sesssion Storage se student_id 
window.addEventListener('load', async () => {
    
    const username = sessionStorage.getItem("username");
	const studentData = await getStudentById(username);

    console.log(username);
    console.log("student data: ",studentData);
    console.log("student d:",studentData.student.class_id);
	if(studentData.student && studentData.student.class_id) {
        await requesttogetsubjects(studentData.student.class_id);
    }
});

async function getStudentById(studentId)
{
	console.log("param:",studentId);
    try
	{
		const response = await fetch(`${API_BASE}/students?studentId=${studentId}`);
	    const results = await response.json();
	    console.log(results);
	    loadStudentData(results.student);
        return results;
	    
	}
	catch(error)
	{
	const studentIdElement = document.getElementById('student_id');
    const studentNameElement = document.getElementById('student_name');
    const studentAgeElement = document.getElementById('student_age');
    const classNameElement = document.getElementById('class_name');
    const classIdElement = document.getElementById('class_id');
    
    studentIdElement.textContent = '-'
    studentNameElement.textContent = '-'
    studentAgeElement.textContent ='-'
    classNameElement.textContent ='-'
    classIdElement.textContent = '-'
	}
}
function loadStudentData(results)
{
	const studentIdElement = document.getElementById('student_id');
    const studentNameElement = document.getElementById('student_name');
    const studentAgeElement = document.getElementById('student_age');
    const classNameElement = document.getElementById('class_name');
    const classIdElement = document.getElementById('class_id');
    
    studentIdElement.textContent = results.id
    studentNameElement.textContent = results.name;
    studentAgeElement.textContent = results.age;
    classNameElement.textContent = results.class;
    classIdElement.textContent = results.id ;
    
}

const api = API_BASE;

async function requesttogetsubjects(classNo)
{
	try
	{
		const response = await fetch(`${api}/classes/?classNo=${classNo}`);
	    const results = await response.json();
	    console.log(results);
        loadsubjects(results.subjects);
	}
	catch(error)
	{
        console.log(error);
	    const  subjectpart = document.getElementById('subjects-container');
        const container = document.createElement('h1');
        container.textContent = 'No Subjects Found'
        subjectpart.appendChild(container)	
	}
	 
}

function loadsubjects(subjectsArray)
{
    const stdid = Number(document.getElementById("student_id").textContent);
    console.log(stdid);
    const container = document.getElementById('subjects-container');
    container.innerHTML = '';
	subjectsArray.forEach((subject,index) =>
	{
	   const card = document.createElement('div');
	   card.className = 'subject-card' ;
	   
	     card.innerHTML = `
        <h3>${subject.subject_name}</h3>
        <p>Teacher: ${subject.tname}</p>
        <p>Class: ${subject.class_id}</p>
        <button class="view-marks-btn" id = "${index+1}" data-stdid ="${stdid}" data-sub="${subject.subject_name}">
            View Marks
        </button>
    `;
        container.appendChild(card);  
    });
    	
    document.querySelectorAll(".view-marks-btn").forEach(btn=>{
        const sid = btn.getAttribute("data-stdid");
        const subject = btn.getAttribute("data-sub");
        btn.addEventListener("click",async ()=>{
            await showMarks(sid,subject);
        });
    });
}

async function getExamData(student_id,subject_name)
{
	
	try
	{
		const response = await fetch(`${api}/students/Exam_Data?studentId=${student_id}&subject_name=${subject_name}`)
		const results = await response.json();
		console.log(results);
		return results;
	}
	catch(error)
	{
		document.getElementById('table-popup').style.display = 'flex';
		
		const tbody = document.getElementById('exam-body');
		tbody.innerHTML = '';
		const row = document.createElement('tr');
		const cell = document.createElement('td');
		cell.colSpan = 7 ;
		
		cell.innerHTML = '<h3>No Record Found</h3>';
		
		row.appendChild(cell);
		
		tbody.appendChild(row);
		console.log(error);
        return null;
	}
}



async function showMarks(subject_id,subjectName)
{
	document.getElementById('table-popup').style.display = 'flex';
	document.querySelector('.popup-title').textContent = `${subjectName} - Exam Details`;
	  
	const examData = await getExamData(subject_id,subjectName);
	
	if(examData === null) return;

	const tbody = document.getElementById('exam-body');
	tbody.innerHTML = '';
	
	examData.exam.forEach((exam , index) =>
	{
		const row = document.createElement('tr');
		
		 row.innerHTML = `
            <td>${exam.student_id}</td>
            <td>${exam.student_name}</td>
            <td>${exam.class_number}</td>
            <td>${exam.subject_name}</td>
            <td>${exam.obtained_marks}</td>
            <td>${exam.total_marks}</td>
            <td>${exam.grade}</td>
        `;
        tbody.appendChild(row);
	});
}

function hideExamPopup()
{
	document.getElementById('table-popup').style.display = 'none';
}








