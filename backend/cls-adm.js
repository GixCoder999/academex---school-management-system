const db = require('./db');  // adjust relative path

module.exports = (app)=> {
    
    let ClassStudents=[];
    let ClassTeachers=[];
    let ClassSubjects=[];
    let availableSubjectsData=[];
    let rooms=[];
    let notices=[];

    function stringifyClassId(class_id) {
        switch(Number(class_id)) {
            case 1: return '1st';
            case 2: return '2nd';
            case 3: return '3rd';
            case 4: return '4th';
            case 5: return '5th';
            case 6: return '6th';
            case 7: return '7th';
            case 8: return '8th';
            case 9: return '9th';
            case 10: return '10th';
        }
        return
    }

    app.get('/classCount',async (req,res)=>{
        try {
            db.query('select count(*) as ClassCount from classes',(err,results)=>{
                if (err) {
                    res.json({status:false,message:"An internal server error occurred"});
                    console.log(err);
                }
                else {
                    res.json(results[0]);
                    console.log(results[0]);
                }
            });
        }
        catch(err) {
            res.json({status:false,message:"An internal server error occurred"});
            console.log(err);
        }
    });

    app.get('/notices', (req,res)=>{

        db.query('select * from notices order by notice_id desc',(err,results)=>{
            if (err) {
                console.log(err);
                return res.json({status:false,message:"An internal server error occurred"});
            }
            //console.log(results);
            notices=results;
            return res.json({status:true,notices:results});
        });
    });

    app.get('/noticeDetails', (req, res) => {
        const notice_id = Number(req.query.notice_id);

        const notice = notices.find(n => n.notice_id === notice_id);

        if (!notice) {
            return res.json({ status: false, message: "Notice not found" });
        }

        return res.json({ status: true, notice });
    });

    app.post('/postNotice', (req, res) => {
        const { title, description, audience } = req.body;

        if (!title || !audience) {
            return res.json({ status: false, message: "Title and audience are required" });
        }
        let que;
        if (description) {
            que = `INSERT INTO notices (title, ndescription, audience) VALUES (?, ?, ?)`;
            db.query(que, [title, description, audience], (err, result) => {
                if (err) {
                    if (err.errno==1062) return res.json({status:false,message:"Cannot add duplicate notice"});
                    console.log(err);
                    return res.json({ status: false, message: "An internal server error occurred" });
                }
                res.json({ status: true, message: "Notice posted successfully" });
            });

        }
        else {
            que = `INSERT INTO notices (title, audience) VALUES (?, ?)`;
            db.query(que, [title, audience], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.json({ status: false, message: "An internal server error occurred" });
                }
                res.json({ status: true, message: "Notice posted successfully" });
            });
        }
    });

    app.delete('/deleteNotice',(req,res)=>{
        const {notice_Id} = req.body;
        
        const que = `DELETE from notices where notice_id = ?`;

        db.query(que,[notice_Id],(err,results)=>{
            if (err) {
                console.log(err);
                return res.json({status:false,message:"An internal server error occured"});
            }
            console.log(results);
            return res.json({status:true,message:"Notice deleted successfuly."});
        });
    });

    function AvailableRooms() {
        return new Promise((resolve,reject)=>{
            db.query('select room_no from classes',(err,results)=>{
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    async function loadRooms() {
        rooms = await AvailableRooms();
    }

    function isAvailable(room) {
        let available=0;
        rooms.forEach(r=>{
            if (r.room_no==room) available=1;
            console.log("working");
        })
        if (available) return true;
        return false;
    }

    function getClassTeachers() {
        return new Promise((resolve, reject) => {
            const que = `select ta.class_id as class_number,ta.teacher_id,t.name as tname,ta.subject_code as tsubject,c.room_no 
                        from teacher_assignments ta,teachers t,classes c
                        where ta.teacher_id=t.teacher_id and ta.class_id=c.class_id`;
            
            db.query(que, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    function getClassStudents() {
        return new Promise((resolve, reject) => {
            const que = `select s.id as sid,s.name as sname,c.class_name,c.room_no,c.class_number from classes c,students s
                        where s.class_id=c.class_number`;
            
            db.query(que, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    function getClassSubjects() {
        return new Promise((resolve, reject) => {
            const que = `select s.subject_id as subject_code,s.subject_name,class_number,sub.room_no
                        from subjects s,classes c,rooms sub
                        where s.class_id=c.class_number and c.class_number=sub.room_id`;
            
            db.query(que, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    async function loadClsTeachers() {
        ClassTeachers = await getClassTeachers();
        console.log(ClassTeachers);
    }

    async function loadClassStudents() {
        ClassStudents = await getClassStudents();
        //console.log(ClassStudents);
    }

    async function loadClassSubjects() {
        ClassSubjects = await getClassSubjects();
        //console.log(ClassSubjects);
    }

    loadClsTeachers();
    loadClassStudents();
    loadClassSubjects();
    loadRooms();

    app.get('/classTeachers',async (req, res) => {
        classid = req.query.class_id;
        console.log(classid);
        if (classid) {
            try { 
                let filteredTeachers = ClassTeachers.filter(c => c.class_number == classid);
                res.json({status:true,message:"Data Loaded Successfully",filteredTeachers});
                console.log(filteredTeachers);
            }
            catch(err) {
                res.json({status:false,message:"An internal server error occurred"});
                console.log(err);
            }
        } 
        else {
            res.json({status:false, message:'Class id is required'});
        }
    });

    app.get('/classStudents',async (req, res) => {
        classid = req.query.class_id;
        if (classid) {
            try { 
                let filteredStudents = ClassStudents.filter(c => c.class_number == classid);
                res.json({status:true,message:"Data Loaded Successfully",filteredStudents});
                //console.log(filteredStudents);
            }
            catch(err) {
                res.json({status:false,message:"An internal server error occurred"});
                console.log(err);
            }
        } 
        else {
            res.json({status:false, message:'Class id is required'});
        }
    });

    app.get('/classSubjects',async (req,res)=> {
        classid = req.query.class_id;
        if (classid) {
            try { 
                let filteredSubjects = ClassSubjects.filter(s => s.class_number == classid);
                res.json({status:true,message:"Data Loaded Successfully",filteredSubjects});
                //console.log(filteredSubjects);
            }
            catch(err) {
                res.json({status:false,message:"An internal server error occurred"});
                console.log(err);
            }
        } 
        else {
            res.json({status:false, message:'Class id is required'});
        }
    });

    app.get('/availableRooms',async (req,res)=> {
        try {
            res.json({status:true,rooms});
        }
        catch(err) {
            res.json({status:false});
            console.log(err);
        }
    });

    app.get('/roomAvailability',async (req,res)=>{
        const room = req.query.room_no
        if (room) {
            try {
                res.json({status:true,roomAvailable:isAvailable(room)});
            }
            catch(err) {
                res.json({status:false,message:"An internal server error occurred"});
                console.log(err);
            }
        }
        else res.json({status:false,message:"Room number is required"});
    });

    app.get('/availableStudents',async (req,res)=>{
        try {
            db.query('select id as sid,name as sname from students where class_id is null',(err,results)=>{
                if (err) {
                    res.json({status:false,message:"An internal server error occurred"});
                    console.log(err);
                }
                else {
                    res.json({status:true,availableStudents:results});
                }
            });
        }
        catch(err) {
            res.json({status:false,message:"An internal server error occurred"});
            console.log(err);
        }
    });

    app.post('/addStudentsToClass',async (req,res)=>{
        const {class_id,students} = req.body;
        if (class_id && students && students.length>0) {
            try {
                const classs = stringifyClassId(class_id);
                
                for (const sid of students) {
                    await new Promise((resolve, reject) => {
                        const sql = `UPDATE students SET class_id=?, class=? WHERE id=?`;

                        db.query(sql, [class_id, classs, sid], (err, result) => {
                            if (err) return reject(err);
                            resolve(result);
                        });
                    });
                }
                res.json({status:true,message:"Students added to class successfully"});
                loadClassStudents();
            }
            catch(err) {
                res.json({status:false,message:"An internal server error occurred"});
                console.log(err);
            }
        }
        else {
            res.json({status:false,message:"Class id and students are required"});
        }
    });

    function subjectAlreadyAssigned(subjects) {
        let result;
        
        subjects.forEach(s=>{
            result = availableSubjectsData.filter(sub=> sub.tsubject===s);
            console.log(result);
            if (result.length>0) return true;
        });
        return false;
    }

    app.post('/addSubjectsToClass', async (req, res) => {
        const class_id = req.body.class_id;
        const subjects = req.body.subjects;
        const tid = req.body.tid;
        //let subject_id;
        console.log(subjects);
        if (!class_id || !subjects || subjects.length === 0) {
            return res.json({ status: false, message: "Class id and subjects are required" });
        }

        if (subjectAlreadyAssigned(subjects)) {
            return res.json({status: false,message:"This subject is already assigned in this class."})
        }

        try {
            for (let i = 0; i < subjects.length; i++) {
                const sub = subjects[i];
                // let subject_id = '';

                // if (class_id < 10) {
                //     subject_id = sub + '-0' + class_id;
                // } else {
                //     subject_id = sub + '-' + class_id;
                // }

                await new Promise((resolve, reject) => {
                    const sql = 'INSERT INTO teacher_assignments (teacher_id, class_id, subject_code) VALUES (?, ?, ?)';
                    db.query(sql, [tid, class_id, sub], (err, result) => {
                        if (err) {
                            if (err.code === 'ER_DUP_ENTRY') {
                                return reject({ duplicate: true, subject: sub });
                            }
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
            }

            res.json({ status: true, message: "Subjects added to class successfully" });
            loadClassSubjects();
            loadClsTeachers();
        } catch (err) {
            console.log(err);
            if (err.duplicate) {
                return res.json({ status: false, message: "Subject " + err.subject + " already exists in this class" });
            }
            return res.json({ status: false, message: "An internal server error occurred" });
        }
    });

    app.get('/availableTeachers',async (req,res)=>{
        const class_id = req.query.class_id;
        console.log(class_id);
        try {
            const que = `SELECT 
                            t.teacher_id,
                            t.name AS tname,
                            COUNT(ta.teacher_id) AS subject_count
                        FROM 
                            teachers t
                        LEFT JOIN 
                            teacher_assignments ta
                                ON t.teacher_id = ta.teacher_id
                                AND ta.class_id = 2
                        GROUP BY 
                            t.teacher_id, t.name
                        HAVING 
                            subject_count <= 5;`
            
            db.query(que,[class_id],(err,results)=>{
                if (err) {
                    return res.json({status:false,message:'An internal server error occurred'});
                }
                    
                console.log(results);
                return res.json({status:true,availableTeachers:results});
            });
        }
        catch(err) {
            res.json({status:false,message:"An internal server error occurred"});
            console.log(err);
        }
    });

    app.get('/availableSubjects', (req, res) => {
        const tid = req.query.tid;
        const class_id = req.query.class_id;
        console.log(tid, class_id);
        // 1️⃣ Check teacher validity
        /*const checkTeacherQuery = `SELECT 
                                    t.teacher_id,
                                    t.name AS tname,
                                    COUNT(ta.teacher_id) AS subject_count
                                FROM 
                                    teachers t
                                LEFT JOIN 
                                    teacher_assignments ta
                                        ON t.teacher_id = ta.teacher_id
                                        AND ta.class_id = ?
                                WHERE 
                                    t.teacher_id = ?
                                GROUP BY 
                                    t.teacher_id, t.name
                                HAVING 
                                    subject_count <= 5`;

        db.query(checkTeacherQuery, [tid, class_id], (err, teacherResult) => {
            if (err) {
                console.log(err);
                return res.json({ status: false, message: 'An internal server error occurred.' });
            }

            if (teacherResult.length === 0) {
                return res.json({ status: false, message: 'Invalid Input' });
            }*/

            // 2️⃣ Fetch available subjects
            const subjectsQuery = `select subject_id as subject_code from subjects where class_id = ? and 
                                subject_id not in (select subject_code from teacher_assignments where class_id = ?)`;
            const classSuffix = class_id.toString().padStart(2, "0");

            db.query(subjectsQuery, [classSuffix, classSuffix], (err, subjectResult) => {
                if (err) {
                    console.log(err);
                    return res.json({ status: false, message: 'An internal server error occurred.' });
                }
                console.log(subjectResult);
                availableSubjectsData = subjectResult;
                return res.json({
                    status: true,
                    availableSubjects: subjectResult
                });
            });

    });

    app.delete('/removeTeacherFromClass',async (req,res) =>{
        const {teacher_id, teacher_name,class_id,subject_code} = req.body;
        const que = "DELETE from teacher_assignments WHERE teacher_id = (SELECT teacher_id FROM teachers WHERE teacher_id = ? AND name = ?) and class_id = ? and subject_code = ?";
        console.log(teacher_id,teacher_name,class_id);
        
        db.query(que,[teacher_id, teacher_name,class_id,subject_code],(err,result)=>{
            if (err) {
                res.json({status:false,message:'An internal server error occurred'});
                console.log(err);
            }
            else {
                res.json({status:true,message:'Teacher removed from class successfully'});
            }
        });
        loadClsTeachers();
    });

    app.delete('/removeStudentFromClass',async (req,res) =>{
        const {std_id, std_name,class_id} = req.body;
        const que = "UPDATE students SET class_id = NULL,class = NULL WHERE id = ? AND name = ?";
        console.log(std_id,std_name,class_id);
        db.query(que,[std_id, std_name],(err,result)=>{
            if (err) {
                res.json({status:false,message:'An internal server error occurred'});
                console.log(err);
            }
            else {
                res.json({status:true,message:'Student removed from class successfully'});
            }
        });
        loadClassStudents();
    });
}