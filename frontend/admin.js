const API_BASE = 'https://academex-school-management-system-production.up.railway.app';

let globData=[];


//Default Credentials wala add kiya
async function addUser(userData) {
    try {
        const response = await fetch(`${API_BASE}/adduser`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        const result = await response.json();  
        return result;
    }
    catch(error)
    {
    	console.log('Error for developer ke liye sirf');
	}
}



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
        if (!token || role!== 'admin') {
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

function logout() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('profilePicPath');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('visited');
    window.location.href='../index.html';
}

function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true' && sessionStorage.getItem('role') === 'admin';
}

function adjustUIForLogin() {
    if (isLoggedIn()) {
        document.getElementById('signin-btn').style.display = 'none';
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

function showloader() {
    document.getElementById("loader").style.display = 'flex';
}

function hideloader() {
    document.getElementById("loader").style.display = 'none';
}

function showMe() {
    showloader();
    setTimeout(() => { hideloader(); }, 1500);
}

document.getElementById("adm-btn").onclick = () => {
    showMe();
    setTimeout(()=>{
        document.getElementById('adm-admin').style.display = 'flex';
        document.getElementById('adm-students').style.display = 'none';
        document.getElementById('adm-teachers').style.display = 'none';
        document.getElementById('adm-classes').style.display = 'none';
        document.getElementById('adm-help').style.display = 'none';
    },1500)
};

document.getElementById("std-btn").onclick = () => {
    showMe();
    setTimeout(() => {
        document.getElementById('adm-admin').style.display = 'none';
        document.getElementById('adm-students').style.display = 'flex';
        document.getElementById('adm-teachers').style.display = 'none';
        document.getElementById('adm-classes').style.display = 'none';
        document.getElementById('adm-help').style.display = 'none';
    }, 1500);
};

document.getElementById("tcr-btn").onclick = () => {
    showMe();
    setTimeout(() => {
        document.getElementById('adm-admin').style.display = 'none';
        document.getElementById('adm-students').style.display = 'none';
        document.getElementById('adm-teachers').style.display = 'flex';
        document.getElementById('adm-classes').style.display = 'none';
        document.getElementById('adm-help').style.display = 'none';
    }, 1500);
};

document.getElementById("cls-btn").onclick = () => {
    showMe();
    setTimeout(() => {
        document.getElementById('adm-admin').style.display = 'none';
        document.getElementById('adm-students').style.display = 'none';
        document.getElementById('adm-teachers').style.display = 'none';
        document.getElementById('adm-classes').style.display = 'flex';
        document.getElementById('adm-help').style.display = 'none';
    }, 1500);
};

document.getElementById("hlp-btn").onclick = () => {
    showMe();
    setTimeout(() => {
        document.getElementById('adm-admin').style.display = 'none';
        document.getElementById('adm-students').style.display = 'none';
        document.getElementById('adm-teachers').style.display = 'none';
        document.getElementById('adm-classes').style.display = 'none';
        document.getElementById('adm-help').style.display = 'flex';
    }, 1500);
};  

document.getElementById("add-std-to-class-panel").onclick = () => {
    document.getElementById("std-btn").click();
    document.getElementById("std-add-btn").click();
    document.getElementById("edit-class-panel").style.display='none';
}

/*function optionValue(el) {
    const value = el.value;
    const displayOpt = document.getElementById("optheading");
    displayOpt.innerText = 'Class '+value; 
    return value;
}*/

async function load_all_students(el) {
    //id = optionValue(el);

    let class_id = el.value;
    console.log(class_id);   
    const result = await fetch(`${API_BASE}/studentsByClass?class=${class_id}`);
    const data = await result.json();
    globData = data;
    document.getElementById('std-count').innerText = globData.length; //set student count
    if (data.length==0) {
        document.getElementById("std-list").innerHTML = `<p class='error01'>No students exist.</p>`        
    }
    else {
        renderStudentsTable(globData,document.getElementById("std-list"));
    }
}

function renderStudentsTable(data,dest) {
    let table = `<tr class="head-row"><th>ID</th><th>Name</th><th>Age</th><th>Class</th><th>Grade</th></tr>`;
    let i=0;
    data.forEach(student => {
        i++;
        if (i%2==0) {
            table += `<tr class="even-row"><td>${student.id}</td><td>${student.name}</td><td>${student.age}</td><td>${student.class}</td><td>${student.grade}</td></tr>`;
        }
        else {
            table += `<tr class="odd-row"><td>${student.id}</td><td>${student.name}</td><td>${student.age}</td><td>${student.class}</td><td>${student.grade}</td></tr>`;
        }
    });

    dest.innerHTML = table;
}

function ageFilter(data,el) {
    let filtered;

    if (el=='below10') {
        filtered = data.filter(std=> std.age<10);
    }
    else if (el=='10-12') {
        filtered = data.filter(std => std.age>=10 && std.age<=12);
    }
    else if (el=='13-15') {
        filtered = data.filter(std=> std.age>=13 && std.age<=15);
    }
    else if (el=='16-18') {
        filtered = data.filter(std=> std.age>=16 && std.age<=18);
    }
    else if (el=='18+') {
        filtered = data.filter(std=> std.age>=18);
    }
    else {
        filtered = data;
    }

    return filtered;
}

function gradeFilter(data,el) {
    let filtered;

    if (el=='A') {
        filtered = data.filter(std=> std.grade=='A');
    }
    else if (el=='B') {
        filtered = data.filter(std=> std.grade=='B');
    }
    else if (el=='C') {
        filtered = data.filter(std=> std.grade=='C');
    }
    else if (el=='D') {
        filtered = data.filter(std=> std.grade=='D');
    }
    else if (el=='F') {
        filtered = data.filter(std=> std.grade=='F');
    } 
    else if (el=='A-D') {
        filtered = data.filter(std=> std.grade=='A' || std.grade=='B' || std.grade=='C' || std.grade=='D');
    } 
    else {
        filtered = data;
    }

    return filtered;
}

function filters() {
    let dest = document.getElementById("std-list");
    const age = document.getElementById("age").value;
    const gradef = document.getElementById("grade").value;

    let filtered = globData;
    
    filtered = ageFilter(filtered,age);
    filtered = gradeFilter(filtered,gradef);
    let globDataCopy = filtered;

    console.log(globDataCopy);

    renderStudentsTable(globDataCopy,dest);
}

function resetAddFields() {
    document.getElementById("std-name").value = '';
    document.getElementById("std-age").value = '';
    document.getElementById("std-cls").value = '';
    document.getElementById("select-grade").value = 'A';

    document.getElementById("fetched-row").innerHTML = '';
    document.getElementById("stdu-id").value = '';
}






async function addStudent() {
    const name = document.getElementById("std-name").value;
    const age = document.getElementById("std-age").value;
    const clss = document.getElementById("std-cls").value;
    const grade = document.getElementById("select-grade").value;

    if (name=='' || age=='') {
        await Alert('Please fill all the fields');
        return;
    }
    else {
        if (age<5 || age>25) {
            await Alert('Age must be between 5 and 25');
            return;
        }

        if (name.length>50) {
            await Alert('Name is too long');
            return;
        }
    }


    //const newStudent = globData.filter(std=> std.name=name && std.age=age )

    const student = {
        Name : name,
        Age : age,
        Class : clss,
        Grade : grade
    }
  
    console.log(student);

    try {
        const response = await fetch(`${API_BASE}/addStudent`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(student)
        });
        const data = await response.json();
        await Alert(data.message);
    }
    catch (error) {
        console.error('Error:', error);
        await Alert('Error sending request');
    }
    await addUser({usernmae:student.Name,role:'student',id:student.Age});
    resetAddFields();
    load_all_students(document.getElementById('class-opt'));
    //window.location.preventDefault();
}

async function fetchSingleStudent() {
    const id = document.getElementById("stdu-id").value;

    if (!id) {
        await Alert('Please enter Student ID');
        return;
    }
    const student = globData.find(std=> std.id==id);

    if (!student) {
        await Alert('Student not found in the current class view');
        return;
    }
    let el=document.getElementById("fetched-row");
    el.innerHTML = `<label>Name: </label><input type="text" id="upd-name" pattern="^[A-Za-z]+( [A-Za-z]+)*$" value="${student.name}">
                    <label>Age: </label><input type="number" min="5" max="25" placeholder="5-25" id="upd-age" value="${student.age}">
                    <label>Class: </label><input type="number" min="1" max="10" placeholder="1-10" id="upd-class" value="${student.class}">
                    <label>Grade: </label><input type="text" id="upd-grade" value="${student.grade}" disabled>`;


    await Alert("Please read these instructions carefully! Only modify the fields you want to update. Be cautious while entering data as updating with incorrect values may lead to data inconsistency. If you wish to cancel the update process, simply refresh the page and fetch the student data again.");
    //document.getElementById("upd-input").style.display='none';
    //document.getElementById("fetch").style.display='none';
}

async function updateStudent() {
    try {
        const id = document.getElementById("stdu-id").value;
        const name = document.getElementById("upd-name").value;
        const age = document.getElementById("upd-age").value;
        const clss = document.getElementById("upd-class").value;
        const grade = document.getElementById("upd-grade").value;

        if (id=="" || name=="" || age=="" || clss=="" || grade=="") {
            await Alert('Please only modify only those fields you want to update. If no changes, keep the same values. If you want to cancel, please refresh the page and fetch student data again.');
            return;
        }

        const student = {
            ID: id,
            newName: name,
            newAge: age,
            newClass: clss,
            newGrade: grade
        };

        const response = await fetch(`${API_BASE}/updateStudent`,{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(student)        
        });

        const data = await response.json();
        await Alert(data.message);
    }
    catch(err) {
        console.error('Error:', err);
        await Alert('Error sending request');
        return;
    }
    load_all_students(document.getElementById('class-opt'));
    resetAddFields();
}

async function deleteStudent(id='',name='') {
    if (!id && !name) {
        id = document.getElementById("stdd-id").value; 
        name = document.getElementById("stdd-name").value;
    }

    if (!id || !name) {
        await Alert('Please enter both ID and Name');
        return;
    }

    const query = new URLSearchParams({ id, name }).toString();

    try {
        const response = await fetch(`${API_BASE}/deleteStudent?${query}`, {
            method: 'DELETE'
        });

        const msg = await response.text();
        await Alert(msg);
        load_all_students(document.getElementById('class-opt'));
    } 
    catch (error) {
        console.error('Error:', error);
        await Alert('Error sending request');
    }
}

async function loadNotices() {
    try {
        const response = await fetch(`${API_BASE}/notices`);
        const data = await response.json();
        
        if (!data.status) {
            document.getElementById("news").innerHTML = `<p class='error01'>Error loading notices.</p>`;
            return;
        }

        let noticesHTML = '';
        data.notices.forEach(notice => {
            noticesHTML += `<a href="#" class="notice-link" id="${notice.notice_id}"  data-id="${notice.notice_id}">${notice.title}</a>`;
            
        });
        document.getElementById("news").innerHTML = noticesHTML;

        document.querySelectorAll(".notice-link").forEach(link => {
            link.addEventListener("click", () => {
                const id = link.getAttribute("data-id");
                showSingleNotice(id);
            });
        });
    }
    catch (err) {
        document.getElementById("news").innerHTML = `<p class='error01'>Error loading notices.</p>`;
        console.log(err);
    }
}

async function showSingleNotice(noticeId) {
    let notice;
    try {
        const response = await fetch(`${API_BASE}/noticeDetails?notice_id=${noticeId}`);
        const data = await response.json();
        if (!data.status) {
            await Alert(data.message);
            return;
        }

        notice = data.notice;
    }
    catch (err) {
        console.log(err);
        await Alert('Error fetching notice details');
    }
    document.getElementById("display-notice-panel").style.display='flex';
    document.getElementById("notice-heading").innerText = notice.title;
    document.getElementById("notice-desc").innerText = notice.ndescription;  
    document.getElementById("display-notice-btns").innerHTML = `
                        <button type="button" onclick="this.parentNode.parentNode.style.display='none'">Close</button>
                        <button onclick="deleteNotice(${noticeId})">Delete</button>`;
}

async function postNotice() {
    const title = document.getElementById("notice-title").value;
    const description = document.getElementById("notice-description").value;
    const audience = document.getElementById("audience").value;
    console.log(audience);
    const notice = {
        title: title,
        description: description,
        audience: audience
    };

    try {
        const response = await fetch(`${API_BASE}/postNotice`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notice)
        });

        const data = await response.json();
        await Alert(data.message);

        loadNotices();
        document.getElementById("notice-title").value = '';
        document.getElementById("notice-description").value = '';
        document.getElementById("audience").value = 'all';
    } 
    catch (err) {
        await Alert('Error sending request');
        console.log(err);
    }  
}
//quick buttons handlers:

async function deleteNotice(noticeId) {
    console.log("notice: ",noticeId);
    const n = {
        notice_Id: noticeId
    };

    try {
        const response = await fetch(`${API_BASE}/deleteNotice`,{
            method:"DELETE",
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(n)
        });
        const data = await response.json();

        if (data.status) {
            await Alert("Notice deleted successfuly");
            loadNotices();
            document.getElementById("display-notice-panel").style.display='none';
            return;
        }

        await Alert(data.message);
    }
    catch(err) {
        console.log(err);
        await Alert("Error Sending Request");
    }
}



document.getElementById("quick-add-tcr").addEventListener("click",()=>{
    document.getElementById("tcr-btn").click();
});

document.getElementById("quick-add-std").addEventListener("click",()=>{
    document.getElementById("std-btn").click();
    document.getElementById("std-add-btn").click();
});

document.getElementById("quick-view-std").addEventListener("click",()=>{
    document.getElementById("std-btn").click();
});

//no functions code is starting from here on

document.getElementById("std-add-btn").addEventListener("click",()=>{
    document.getElementById("add-std-panel").style.display='flex';
});

document.getElementById("std-dlt-btn").addEventListener("click",()=>{
    document.getElementById("dlt-std-panel").style.display='flex';
});

document.getElementById("std-upd-btn").addEventListener("click",()=>{
    document.getElementById("upd-std-panel").style.display='flex';
});

document.getElementById("age").addEventListener("change",()=>{
    filters();
});

//nav-btn: help handler:

document.getElementById("hlp-btn").addEventListener("click",()=>{
    document.getElementById("quick-sup-btn").click();
});

document.getElementById("grade").addEventListener("change",()=>{
    filters();
});

document.getElementById("add-std-panel").addEventListener("submit", function(e) {
    e.preventDefault();   // stops form from sending GET/POST
    if (!this.checkValidity()) {
        this.reportValidity();
        return;
    }
    addStudent(); // your JS function
});

document.getElementById("upd-std-panel").addEventListener("submit", function(e) {
    e.preventDefault();   // stops form from sending GET/POST
    if (!this.checkValidity()) {
        this.reportValidity();
        return;
    }
    updateStudent(); // your JS function
});

//in case of fresh session reset option values to default i.e. all

window.addEventListener('load',()=>{
    //if (!sessionStorage.getItem('visited')) {
        resetAddFields();

        document.getElementById('class-opt').value = 0;
        document.getElementById('age').value = 'all';
 //       document.getElementById('gender').value = 'all';
        document.getElementById('grade').value = 'all';

        sessionStorage.setItem('visited','true');
    //}

    load_all_students(document.getElementById('class-opt'));
    loadNotices();
});

//===============TEACHER PANEL=================
let tcrData=[];
let fullTcrData;

function renderTeachersTable() {
    let table = `<tr class="head-row"><th>ID</th><th>Name</th><th>Age</th><th>Join Date</th><th>Email</th></tr>`;
    let i=0;
    tcrData.forEach(tcr => {
        i++;

        if (i%2==0) {   //<td>${tcr.class_id}</td>  //<th>Class</th>
            table += `<tr class="even-row"><td>${tcr.teacher_id}</td><td>${tcr.name}</td><td>${tcr.age}</td><td>${tcr.joindate}</td><td>${tcr.email}</td></tr>`;
        }
        else {
            table += `<tr class="odd-row"><td>${tcr.teacher_id}</td><td>${tcr.name}</td><td>${tcr.age}</td><td>${tcr.joindate}</td><td>${tcr.email}</td></tr>`;
        }
    });
    dest = document.getElementById("tcr-list").innerHTML = table;
}

async function loadAllTeachers() {
        
    try {
        const tcr = await fetch(`${API_BASE}/teachers`);
        let data = await tcr.json();
        if (!data.status) {
            await Alert(data.message);
        }
        else {
            tcrData = data.data;
            fullTcrData = [...tcrData];   // backup copy

            for (let i = 0; i < tcrData.length; i++) {
                let d = new Date(tcrData[i].joindate); // parse full ISO date
                const month = String(d.getMonth() + 1).padStart(2, '0'); // months 0-11
                const day = String(d.getDate()).padStart(2, '0');
                const year = d.getFullYear();

                tcrData[i].joindate = `${month}/${day}/${year}`; // mm/dd/yyyy
            }
            document.getElementById("tcr-count").innerText = data.data.length; 
            renderTeachersTable();
        }
    }
    catch (err) {
        console.log(err);
    }
}

function tcrInputFields() {
    const id = document.getElementById("tcrid").value;
    const name = document.getElementById("tcrname").value;
    const age = document.getElementById("tcrage").value;
    const joindate = document.getElementById("tcrjoindate").value;
    //const subject = document.getElementById("tcrsubject").value;
    const email = document.getElementById("tcremail").value;
   // const clas = document.getElementById("tcrclass").value;
    console.log(joindate);
    const inputs = {
        tid: id,
        tname: name,
        tage: age,
        tdate: joindate,
      //  tsubject: subject,
        tmail: email,
       // tclass: clas
    };

    return inputs;
}

function resetTcrFields() {
    document.getElementById("tcrname").value="";
    document.getElementById("tcrage").value="";
    document.getElementById("tcrjoindate").value="";
    //document.getElementById("tcrsubject").value="";
    document.getElementById("tcremail").value="";
}

async function fetchSingleTeacher(data) {
    let id = document.getElementById("tcrid");
    if (!id.value) {
        await Alert("Please fill required fields correctly");
        return;
    }

    const tcr = data.find(t=>t.teacher_id == Number(id.value));
    if (tcr) {
        document.getElementById("tcrname").value = tcr.name;
        document.getElementById("tcrage").value = tcr.age;

        const [month, day, year] = tcr.joindate.split("/"); 
        const newdate = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
        
        document.getElementById("tcrjoindate").value = newdate;
        //document.getElementById("tcrsubject").value = tcr.subject;
        document.getElementById("tcremail").value = tcr.email;
        //document.getElementById("tcrclass").value = tcr.class_id;
    }
    else {
        await Alert("No such teacher exists.");
        resetTcrFields();
    }
}

function alreadyExists(t) {
    let [year, month, day] = t.tdate.split("-");
    const formatted = `${month}/${day}/${year}`;

    let oldt = tcrData.find(tcr =>
        tcr.name == t.tname &&
        tcr.age == t.tage && 
        tcr.joindate == formatted &&
        //tcr.subject == t.tsubject &&
        tcr.email == t.tmail //&&
        //tcr.class_id == t.tclass
    );
    
    if (oldt) {
        return true;
    }
    return false;
}

async function addTeacher() {
    let t = tcrInputFields();

    if (alreadyExists(t)) {
        await Alert("This data already exists");
        return;
    }

    if (t.tname==''||t.tage==''||t.tdate==''||/*t.tsubject==''||*/t.tmail=='') {
        await Alert("Please fill all required fields");
        return;
    }

    const result = await Alert('Please note that any data currently present in the fields(except ID) will be considered and added as a new teacher if it doesnt exists already.','C')
    
    if (!result) return;

    try {
        console.log(t);
        const data = await fetch(`${API_BASE}/addTeacher`,{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(t)        
        });
        const msg = await data.json();
        console.log(msg);
        if (msg.status) {
            await Alert("Teacher Added Successfully");
            loadAllTeachers();
            await addUser({username:t.tname,role:'teacher',id:t.tage});
        }
        else await Alert(msg.msg);
    }
    catch(err) {
        console.log(err);
        await Alert("Error sending requests");
    }
}

async function updateTeacher() {
    let t = tcrInputFields();
    
    if (t.tid=='' || t.tname=='' || t.tage=='' || t.tdate=='' || /*t.tsubject=='' ||*/ t.tmail=='') {
        await Alert('No field can be empty. Those fields which you dont want to change leave them as such. Please re-fetch data and try again.');
        return;
    }

    await Alert('Please note that only modify those fields you want to update, for others leave them as such.');

    const result = await Alert('Are you sure you want to make changes? We recommend double checking all the fields.','C');
    if (!result) return;
    if (alreadyExists(t)) {
        await Alert("Same data entered as previous");
        return;
    }
    await Alert('Procceeding...');

    try {
        const data = await fetch(`${API_BASE}/updateTeacher`,{
            method:'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(t)
        });

        const response = await data.json();
        console.log(response);
        if (response.status) await Alert('Teacher Data updated successfuly');
        else await Alert(response.msg);

        resetAddFields();
        loadAllTeachers();
    }
    catch(err) {
        console.log(err);
        await Alert('Error Sending Request.');
    }
}

async function deleteTeacher() {
    const t = tcrInputFields();

    const teacher_id = t.tid; 
    const teacher_name = t.tname;
    
    if(!teacher_id || !teacher_name)  {
    	await Alert('Please enter both ID and Name');
    	return;
	}

    const r = await Alert("Are you sure you want to delete this data?",'C');
    if (!r) return;

	const querydelete = new URLSearchParams({id : teacher_id ,name : teacher_name }).toString();
	try {
		const response = await fetch(`${API_BASE}/deleteTeacher?${querydelete}`, {
            method: 'DELETE'
        });
        
        const message = await response.text();
        await Alert(message);
        loadAllTeachers();
        resetTcrFields();

        //await Alert("This feature is still in development. We appologize any inconvinience");
	}
	catch(error) {
    	console.error('Error: ', error);
		await Alert('Error could not delete Teacher');
        //await Alert("This feature is still in development. We appologize any inconvinience");
    }
}

function tcrAgeFilter(data) {
    const age = document.getElementById('agef').value;

    if (age === '20+') return data.filter(t => t.age >= 20);
    if (age === '21-25') return data.filter(t => t.age >= 21 && t.age <= 25);
    if (age === '26-30') return data.filter(t => t.age >= 26 && t.age <= 30);
    if (age === '31-40') return data.filter(t => t.age >= 31 && t.age <= 40);
    if (age === '40+') return data.filter(t => t.age >= 40);

    return data;
}

function tcrJoinDateFilter(data) {
    const date = document.getElementById('datef').value;
    if (date === '') return data;

    // Convert yyyy-mm-dd → mm/dd/yyyy
    const [yyyy, mm, dd] = date.split("-");
    const formatted = `${mm}/${dd}/${yyyy}`;

    return data.filter(t => t.joindate === formatted);
}

// function tcrsubjectFilter(data) {
//     const sub = document.getElementById('subjectf').value;

//     if (sub === 'all') return data;
//     return data.filter(t => t.subject === sub);
// }

function tcrFilters() {
    // Always start filtering from original full data
    let filtered = [...fullTcrData];

    filtered = tcrAgeFilter(filtered);
    filtered = tcrJoinDateFilter(filtered);
    //filtered = tcrsubjectFilter(filtered);

    tcrData = filtered;
    renderTeachersTable();
}

const form = document.getElementById("tcrform");

function validateForm() {
    if (!form.checkValidity()) {
        form.reportValidity(); // shows native messages
        return false;
    }
    return true;
}

document.getElementById("fetchTcr").addEventListener("click",()=>{
    fetchSingleTeacher(tcrData);
});

document.getElementById("tcr-add-btn").addEventListener("click", (e) => {
    e.preventDefault(); // no reload
    if (!validateForm()) return;
    addTeacher();
});

document.getElementById("tcr-upd-btn").addEventListener("click", (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    updateTeacher();
});

document.getElementById("tcr-dlt-btn").addEventListener("click", (e) => {
    e.preventDefault();

    if (!document.getElementById("tcrid").checkValidity()) {
        document.getElementById("tcrid").reportValidity();
        return;
    }

    deleteTeacher();
});

document.getElementById("agef").addEventListener("change",()=>{
    tcrFilters();
});

document.getElementById("datef").addEventListener("change",()=>{
    tcrFilters();
});

// document.getElementById("subjectf").addEventListener("change",()=>{
//     tcrFilters();
// });

window.addEventListener("load",()=>{
    loadAllTeachers();
});

//Classes:

async function RemoveTeacherFromClass(id,name,subject) {
    const class_id=document.getElementById("cls-for-classes").value;
    if (class_id==0) return;
    console.log(id,name,class_id,subject);
    try {
        const response = await fetch(`${API_BASE}/removeTeacherFromClass`,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({teacher_id: id, teacher_name: name,class_id: class_id,subject_code:subject})
        });
    
        const data = await response.json();
        await Alert(data.message);
        getClassData();
    }
    catch(err) {
        console.log(err);
        await Alert("Error sending request");
    }
}

async function RemoveStudentFromClass(id,name) {
    const class_id=document.getElementById("cls-for-classes").value;
    console.log(id,name,class_id);
    try {
        const response = await fetch(`${API_BASE}/removeStudentFromClass`,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({std_id: id, std_name: name,class_id: class_id})
        });
    
        const data = await response.json();
        await Alert(data.message);
        getClassData();
    }
    catch(err) {
        console.log(err);
        await Alert("Error sending request");
    }
}

function renderClassTcrTable(data) {
    let table=`<tr class="head-row"><th>No.</th><th>Teacher ID</th><th>Teacher Name</th><th>Subject</th><th>Actions</th></tr>`;
    let i=0;
    data.forEach((t,idx)=>{
        i++;
        table += `<tr class='cls-row'>
                    <td>${i}</td>
                    <td>${t.teacher_id} </td>
                    <td>${t.tname}</td>
                    <td>${t.tsubject}</td>
                    <td><button id="cls-dlt-btn" class="cls-tcr-dlt" data-id="${t.teacher_id}" data-name="${t.tname}" data-subject="${t.tsubject}">Remove</button></td>
               </tr>`
               console.log(t.tsubject);
    });

    document.getElementById("cls-table").innerHTML = table;

    document.querySelectorAll(".cls-tcr-dlt").forEach(btn=>{
        btn.onclick = () => {
            const t_id = btn.getAttribute("data-id");
            const t_name = btn.getAttribute("data-name");
            const teachsubject = btn.getAttribute("data-subject");
            console.log("tid:",t_id,"tname",t_name,teachsubject);
            RemoveTeacherFromClass(t_id,t_name,teachsubject);
        }
    });
}

function renderClassStdTable(data) {
    let table=`<tr class="head-row"><th>No.</th><th>Studnet ID</th><th>Student Name</th><th>Actions</th></tr>`;
    let i=0;
    data.forEach(s=>{
        i++;
        table += `<tr class='cls-row'>
                    <td>${i}</td>
                    <td>${s.sid} </td>
                    <td>${s.sname}</td>
                    <td><button id="cls-dlt-btn" class="cls-std-rem" data-id="${s.sid}" data-name="${s.sname}">Remove</button></td>
                </tr>`
    });

    document.getElementById("cls-table").innerHTML = table;

    document.querySelectorAll(".cls-std-rem").forEach(btn=>{
        btn.onclick = ()=> {
            console.log("reached");
            const s_id = btn.getAttribute("data-id");
            const s_name = btn.getAttribute("data-name");
            console.log("s_id:", s_id,"sname:",s_name);
            RemoveStudentFromClass(s_id,s_name);
            getClassData();
        }
    });
}

function renderClassSubjectsTable(data) {
    let table=`<tr class="head-row"><th>No.</th><th>Subject Name</th><th>Subject Code</th></tr>`;
    let i=0;
    data.forEach(sub=>{
        i++;
        table += `<tr class='cls-row'>
                    <td>${i}</td>
                    <td>${sub.subject_name}</td>
                    <td>${sub.subject_code}</td>
                </tr>`
    });
    document.getElementById("cls-table").innerHTML = table;
}

async function getClassData() {
    const class_id=document.getElementById("cls-for-classes").value;
    const type=document.getElementById("data-opt").value;

    if (class_id==0) return;

    let clsdata;

    if (type=="std") {
        try {
            const data = await fetch(`${API_BASE}/classStudents?class_id=${class_id}`);
            const clsdata = await data.json();
            
            if (clsdata.status) {
                if (clsdata.filteredStudents.length==0) {
                    await Alert("Students exist in this class");
                    document.getElementById("class-details").innerHTML=`
                            <label for="">Total Students: </label>
                            <p id="cls-total-std">${clsdata.filteredStudents.length}</p>`;

                    renderClassStdTable(clsdata.filteredStudents);
                    return;
                }
                console.log(clsdata.filteredStudents);
                document.getElementById("class-details").innerHTML=`
                        <label for="">Room: </label>
                        <p id="cls-room">${clsdata.filteredStudents[0].room_no}</p>
                        <label for="">Total Students: </label>
                        <p id="cls-total-std">${clsdata.filteredStudents.length}</p>`;
                renderClassStdTable(clsdata.filteredStudents);
            }
            else await Alert(clsdata.message);    
        }
        catch(err) {
            console.log(err);
            await Alert("Error sending request");
        }   
    }
    else if (type=="tcr") {
        try {
            const data = await fetch(`${API_BASE}/classTeachers?class_id=${class_id}`);
            const clsdata = await data.json();
        
            
            if (clsdata.status) {
                if (clsdata.filteredTeachers.length==0) {
                    await Alert("No Teacher exist in this class");
                    document.getElementById("class-details").innerHTML=`
                            <label for="">Total Teachers: </label>
                            <p id="cls-total-std">${clsdata.filteredTeachers.length}</p>`;
                    renderClassTcrTable(clsdata.filteredTeachers);
                    return;
                }
                console.log(clsdata.filteredTeachers);
                document.getElementById("class-details").innerHTML=`
                        <label for="">Room: </label>
                        <p id="cls-room">${clsdata.filteredTeachers[0].room_no}</p>
                        <label for="">Total Teachers: </label>
                        <p id="cls-total-std">${clsdata.filteredTeachers.length}</p>`;
                renderClassTcrTable(clsdata.filteredTeachers);
            }
            else await Alert(clsdata.message);    
        }
        catch(err) {
            console.log(err);
            await Alert("Error sending request");
        }
    } 
    else {
        try {
            const data = await fetch(`${API_BASE}/classSubjects?class_id=${class_id}`);
            const clsdata = await data.json();
        
            
            if (clsdata.status) {
                if (clsdata.filteredSubjects.length==0) {
                    await Alert("No Subjects exist in this class");
                    document.getElementById("class-details").innerHTML=`
                        <label for="">Total Subjects: </label>
                        <p id="cls-total-std">${clsdata.filteredSubjects.length}</p>`;
                    renderClassSubjectsTable(clsdata.filteredSubjects);
                    return;
                }
                console.log(clsdata.filteredSubjects);
                
                document.getElementById("class-details").innerHTML=`
                        <label for="">Room: </label>
                        <p id="cls-room">${clsdata.filteredSubjects[0].room_no}</p>
                        <label for="">Total Subjects: </label>
                        <p id="cls-total-std">${clsdata.filteredSubjects.length}</p>`;
                renderClassSubjectsTable(clsdata.filteredSubjects);
            }
            else await Alert(clsdata.message);    
        }
        catch(err) {
            console.log(err);
            await Alert("Error sending request");
        }
    } 
}

function setClassCount(count) { 
    document.getElementById("cls-count").innerText = count;
}

async function getClassCount() {
    try {
        const data = await fetch(`${API_BASE}/classCount`); 
        let result = await data.json();
        setClassCount(result.ClassCount);
        console.log(result.ClassCount);
    }
    catch(err) {
        console.log(err);
    }
}


window.addEventListener("load",()=>{
    getClassCount();
});

document.getElementById("cls-for-classes").addEventListener("change",()=>{
    getClassData(); 
});

document.getElementById("data-opt").addEventListener("change",()=>{
    getClassData()
});

async function renderAvailableStudentsList() {
    try {
        const data = await fetch(`${API_BASE}/availableStudents`);
        const stddata = await data.json();
         
        if (stddata.status) {
            if (stddata.availableStudents.length==0) {
                await Alert("No available students to add");
            }
            console.log(stddata.availableStudents);
            options = ``;
            stddata.availableStudents.forEach(s=>{
                options += `<option value="${s.sid}">${s.sname} (ID: ${s.sid})</option>`;
            });
            document.getElementById("std-opt-list").innerHTML = options;
        }
        else await Alert(stddata.message);
    }
    catch (err) {
        console.log(err);
        await Alert("Error sending request");
    }
}

function getSelections(selectEl=document.getElementById("std-opt-list")) {
    
    const values = [];

    for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].selected) {
            values.push(selectEl.options[i].value);
        }
    }
    console.log(values);
    return values;
}

document.getElementById("add-std-to-class-panel").addEventListener("click",()=>{
    document.getElementById("pre-opts").style.display='none';
    document.getElementById("std-opt").style.display='flex';
    renderAvailableStudentsList();
});


async function renderAvailableSubjectsList() {
    const tid = document.getElementById("tcr-opt-list").value;
    const class_id = document.getElementById("cls-for-classes").value;
    try {
        const data = await fetch(`${API_BASE}/availableSubjects?tid=${tid}&class_id=${class_id}`);
        const subdata = await data.json();

        if (subdata.status) {
            if (subdata.availableSubjects.length==0) {
                await Alert("No available subjects to add");
            }
        
            let options='';
            subdata.availableSubjects.forEach(s=>{
                options += `<option value=${s.subject_code}>${s.subject_code}</option>`
            });
            document.getElementById("sub-opt-list").innerHTML = options;
        }
        //await Alert(subdata.status);
        else await Alert(subdata.message);
    }
    catch (err) {
        console.log(err);
    }
}

async function renderAvailableTeachers() {
    try {
        class_id = document.getElementById("cls-for-classes").value;
        const data = await fetch(`${API_BASE}/availableTeachers?class_id=${class_id}`);
        const tcrdata = await data.json();

        if (tcrdata.status) {
            if (tcrdata.availableTeachers.length==0) {
                await Alert("No available teachers to add");
            }
            
            let options='';

            tcrdata.availableTeachers.forEach(t=>{
                options += `<option value=${t.teacher_id}>${t.tname} (ID: ${t.teacher_id})</option>`
            });
            document.getElementById("tcr-opt-list").innerHTML = options;
        }
        else await Alert(tcrdata.message);
    }
    catch (err) {
        console.log(err);
    }
}

document.getElementById("add-sub-to-class-panel").addEventListener("click",()=>{
    document.getElementById("pre-opts").style.display='none';
    document.getElementById("sub-opt").style.display='none';
    document.getElementById("tcr-opt").style.display='flex';
    renderAvailableTeachers();
});

document.getElementById('assign-tcr-to-sub').onclick = ()=>{
    document.getElementById("pre-opts").style.display='none';
    document.getElementById("tcr-opt").style.display='none';
    document.getElementById("sub-opt").style.display='flex';
    renderAvailableSubjectsList();
}

document.getElementById("add-std-to-class").addEventListener("click",async ()=>{
    const class_id = document.getElementById("cls-for-classes").value;
    const selectedStudents = getSelections();
    
    if (class_id==0) {
        await Alert("Please select a class first");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/addStudentsToClass`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ class_id, students: selectedStudents })
            
        });

        const data = await response.json();
        await Alert(data.message);
        renderAvailableStudentsList();
        getClassData();
    }
    catch(err) {
        console.log(err);
        await Alert("Error sending request");
    }
});

document.getElementById("add-sub-to-class").addEventListener("click",async ()=>{    
    const class_id = document.getElementById("cls-for-classes").value;
    const selectedSubjects = getSelections(document.getElementById("sub-opt-list"));
    const tid = document.getElementById("tcr-opt-list").value;
    if (class_id==0) {
        await Alert("Please select a class first");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/addSubjectsToClass`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({class_id, tid, subjects:selectedSubjects})
        });

        const data = await response.json();
        await Alert(data.message);
        getClassData();
        renderAvailableSubjectsList();
    }
    catch(err) {
        console.log(err);
        await Alert("Error sending request");
    }
});

document.getElementById("cls-edit-btn").addEventListener("click",()=>{
    document.getElementById("pre-opts").style.display='flex';
    document.getElementById("std-opt").style.display='none';
    document.getElementById("sub-opt").style.display='none';
    document.getElementById("tcr-opt").style.display='none';
    document.getElementById("edit-class-panel").style.display='flex';
});

document.querySelectorAll("#close-btn").forEach(btn=> {
    btn.onclick = ()=>{
        document.getElementById("pre-opts").style.display='none';
        document.getElementById("std-opt").style.display='none';
        document.getElementById("sub-opt").style.display='none';
        document.getElementById("tcr-opt").style.display='none';
        document.getElementById("edit-class-panel").style.display='none';
    }
});