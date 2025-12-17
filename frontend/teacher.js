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
        if (!token || role !== 'teacher') {
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
    return sessionStorage.getItem('isLoggedIn') === 'true' && sessionStorage.getItem('role') === 'teacher';
}

function adjustUIForLogin() {
    if (isLoggedIn()) {
        document.getElementById('logout-btn').style.display = 'inline-block';
        profilePicPath = sessionStorage.getItem('profilePicPath');
        console.log(profilePicPath);
        document.getElementById('user-img').src = `${API_BASE}/${profilePicPath}`;
    }
    else {
        document.getElementById('signin-btn').style.display = 'inline-block';
        document.getElementById('logout-btn').style.display = 'none';
        profilePicPath = 'uploads/user.png';
        console.log(profilePicPath);
        document.getElementById('user-img').src = `${API_BASE}/${profilePicPath}`;
    }
}

checkLogin();
adjustUIForLogin();

function logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('profilePicPath');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('visited');
    window.location.href = 'signin_real.html';
}

document.addEventListener('DOMContentLoaded', async ()=> {
    let teacherId;
    let teacherName='';
    const username = sessionStorage.getItem("username");
    console.log(username);
    async function getTeacherDetails() {
        try {
            const data = await fetch(`${API_BASE}/teachers/t?username=${username}`);
            const result = await data.json();
            console.log(result.tid,result.tname);
            teacherId = result.tid;
            teacherName = result.tname;  
        }
        catch (err) {
            console.log(err);
        }
    }

    await getTeacherDetails();

    const classCardsContainer = document.getElementById('class-cards');
    const subjectsContainer = document.getElementById("subjects-container");
    const tableWrapper = document.getElementById('table-wrapper');
    const editMarksModal = document.getElementById('edit-marks-modal');
    const marksForm = document.getElementById('edit-marks-form');
    const marksInput = document.getElementById('edit-obtained-marks');
    const studentIdInput = document.getElementById('student-id');
    const studentNameSpan = document.getElementById('edit-student-name');
    
    // ==================== STATE VARIABLES ====================
    let currentTeacherId = teacherId;
    let currentClassNo = null;
    let currentClassName = null;
    let currentSubject = null;
    let currentStdId = null;
    
    // ==================== FUNCTIONS ====================
    async function loadTeacherClasses() {
        try {
            const response = await fetch(`${API_BASE}/api/teachers/${currentTeacherId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                renderClassCards(data.classes || []);
            } else {
                showError('Failed to load classes: ' + data.message);
            }
        } catch (error) {
            console.error('Error loading classes:', error);
            showError('Network error. Check if backend is running on port 3000.');
        }
    }
    
    loadTeacherClasses();

    function renderClassCards(classes) {
        classCardsContainer.innerHTML = '';
        
        if (classes.length === 0) {
            classCardsContainer.innerHTML = `
                <div class="no-classes">
                    <p>No classes assigned to you yet.</p>
                </div>
            `;
            return;
        }
        
        classes.forEach(cls => {
            const classCard = document.createElement('div');
            classCard.className = 'class-card';
            classCard.innerHTML = `
                <h3>Class Name: ${cls.class_name}</h3>
                <p>Class: ${cls.class_id}</p>
                <button class="view-class-btn" 
                        data-class-no="${cls.class_id}"
                        data-class-name="${cls.class_name}">
                    View Class
                </button>
            `;
            classCardsContainer.appendChild(classCard);
        });
        
        // Add event listeners to view class buttons
        document.querySelectorAll('.view-class-btn').forEach(button => {
            button.addEventListener('click', function() {
                currentClassNo = this.getAttribute('data-class-no');
                currentClassName = this.getAttribute('data-class-name');
                loadSubjectsForClass();
            });
        });
    }
    
    async function loadSubjectsForClass() {
        try {
            const response = await fetch(`${API_BASE}/api/teachers/${currentTeacherId}/classes/${currentClassNo}/subjects`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                showSubjects(data.subjects);
            } else {
                showError('Failed to load subjects: ' + data.message);
            }
        } catch (error) {
            console.error('Error loading subjects:', error);
            showError('Failed to load subjects');
        }
    }
    
    function showSubjects(subjects) {
        let opt = `<option value="">---Select Subject---</option>`;
        subjects.forEach(s=>{
            opt += `<option value="${s.subject}">${s.subject}</option>`;
        });

        document.getElementById("subjects-list").innerHTML = opt;
        
        // Show subjects container, hide others
        subjectsContainer.style.display = 'flex';
        tableWrapper.style.display = 'none';
    
        document.getElementById("view-class-stds").addEventListener("click",async ()=>{
            const subject = document.getElementById("subjects-list").value;
            currentSubject = subject;
            if (subject!="") {
                loadStudentsForSubject(subject);
                return;
            }
            await Alert("Please select a subject first");
            return;
        });
    }
    
    async function loadStudentsForSubject(currentSubject) {
        try {
            const response = await fetch(`${API_BASE}/api/classes/${currentClassNo}/subjects/${encodeURIComponent(currentSubject)}/students`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(data);

            if (data.success) {
                if (data.students && data.students.length > 0) {
                    renderStudentsTable(data.students);
                    
                } else {
                    renderStudentsTable(data.students);
                }
            } else {
                showError('Failed to load students: ' + data.message);
            }
        } catch (error) {
            console.error('Error loading students:', error);
            showError('Failed to load students');
        }
    }    

    function renderStudentsTable(students) {
        // Hide subjects, show table
        subjectsContainer.style.display = 'none';
        document.getElementById("table-popup").style.display = 'flex';
        tableWrapper.style.display = 'flex';

        let row;
        if (students.length==0) {
            row = 'No Student Found.'; 
            document.getElementById("students-table").innerHTML = row;
            return;
        }
        // Clear table
        row = `<thead>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Grade</th>
                        <th>Marks</th>
                        <th>Actions</th>
                    </thead>`;
        // Add students to table
        students.forEach(student => {
            row += `<tr>
                <td>${student.student_id || student.id || 'N/A'}</td>
                <td>${student.student_name || student.name || 'N/A'}</td>
                <td>${student.grade || 'N/A'}</td>
                <td>${student.obtained_marks || 'Not graded'}</td>
                <td>
                    <button class="edit-marks-btn"
                            data-student-id="${student.student_id || student.id}"
                            data-student-name="${student.student_name || student.name}"
                            data-current-marks="${student.obtained_marks || ''}">
                        Edit Marks
                    </button>
                </td></tr>`;
        });

        document.getElementById("students-table").innerHTML = row;
        
        // Add event listeners to edit marks buttons
        document.querySelectorAll('.edit-marks-btn').forEach(button => {
            button.addEventListener('click', function() {
                const studentId = this.getAttribute('data-student-id');
                const studentName = this.getAttribute('data-student-name');
                const currentMarks = this.getAttribute('data-current-marks');

                openEditMarksModal(studentId, studentName, currentMarks);
            });
        });
    }
    
   function openEditMarksModal(studentId, studentName, currentMarks) {
        studentNameSpan.textContent = studentName;
        studentIdInput.textContent = studentId;
        marksInput.value = currentMarks || '';
        console.log(studentId);
        currentStdId = studentId;

        editMarksModal.style.display = 'flex';
    }
    
    async function handleMarksSubmit(e) {
        e.preventDefault();
        
        const marks = marksInput.value;
        const studentId = studentIdInput.value;
        
        if (!marks || marks < 0 || marks > 100) {
            showError('Please enter valid marks between 0 and 100');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/classes/${currentClassNo}/subjects/${encodeURIComponent(currentSubject)}/students/${currentStdId}/marks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ marks: parseFloat(marks) })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                await Alert('Marks updated successfully!');
                closeEditMarksModal();
                // Refresh the students table
                loadStudentsForSubject(currentSubject);
            } else {
                showError('Failed to update marks: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating marks:', error);
            showError('Failed to update marks');
        } 
    }
    
    function closeEditMarksModal() {
        editMarksModal.style.display = 'none';
        marksForm.reset();
    }

    async function showError(message) {
        await Alert('Error: ' + message);
    }
    
    marksForm.addEventListener('submit', handleMarksSubmit);

    document.getElementById("close-btn").addEventListener("click",()=>{
        document.getElementById("subjects-container").style.display="none";
    });
    
});



// New Annoucments Logic Added 

async function loadAnnouncements() {
    try {
       const response = await fetch(`${API_BASE}/posts?audience=teachers`);
        
        const data = await response.json();
        console.log(data);
        if (data.success && data.results && data.results.length > 0) {
            displayAnnouncements(data.results);
        } else {
            displayNoAnnouncements();
        }
    } catch (error) {
        console.error('Failed to load announcements:', error);
        displayNoAnnouncements();
    }
}


function displayAnnouncements(announcements) {
    const contentArea = document.getElementById('announcement-content-area');
    contentArea.innerHTML = '';
    
    announcements.forEach((announcement, index) => {
        const announcementCard = document.createElement('div');
        announcementCard.className = 'announcement-card';
        announcementCard.innerHTML = `
            <div class="announcement-header">
                <h3>${index + 1}. ${announcement.title || 'No Title'}</h3>
                <span class="announcement-date">${announcement.created_at || 'Date not available'}</span>
            </div>
            <div class="announcement-body">
                <p>${announcement.ndescription || announcement.description || 'No description available'}</p>
            </div>
            <div class="announcement-footer">
                <span class="audience-tag">For: ${announcement.audience || 'ALL'}</span>
            </div>
        `;
        contentArea.appendChild(announcementCard);
    });
    
  
    document.getElementById('announcement-popup').style.display = 'flex';
}


function displayNoAnnouncements() {
    const contentArea = document.getElementById('announcement-content-area');
    contentArea.innerHTML = `
        <div class="no-announcements">
            <i class="bi bi-inbox"></i>
            <h3>No Announcements</h3>
            <p>There are no announcements at the moment.</p>
            <p>Check back later for updates.</p>
        </div>
    `;
    
    
    document.getElementById('announcement-popup').style.display = 'flex';
}


function hideAnnouncementPopup() {
    document.getElementById('announcement-popup').style.display = 'none';
}


function showAnnouncementPopup() {
    loadAnnouncements();
}

 function changePassword() {
    window.location.href = 'SetupPassword.html'; 
}

