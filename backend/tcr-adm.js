const db = require('./db');  // adjust relative path

module.exports = (app) => {    
    app.get('/teachers',async (req, res) => {
        db.query('SELECT * FROM teachers', (err, result) => {
            if (err) {
                res.json({ status: false, message: "An error occurred" });
            } else if (result.length == 0) {
                res.json({ status: false, message: 'No teacher exists' });
            } else {
                res.json({ status: true, data: result });  // <--- send once
            }
        });
    });

    app.post('/addTeacher',async (req,res)=>{
        const {tname,tage,tdate,tmail} = req.body;
        const dummmyUsername = 'abcdefg';
        const que = 'INSERT INTO teachers (name,age,joindate,email,username) VALUES (?,?,?,?,?)';
        //console.log(tname,tage,tdate);
        db.query(que,[tname,tage,tdate,tmail,dummmyUsername],(err,result)=>{
            if (err) { 
                if (err.errno==1062) return res.json({status:false,msg:"Teacher Already Exists / Email Cannot be Duplicate"});
                
                return res.json({status:false,msg:'An internal server error occurred'});
            }
            else {
                res.json({status:true,msg:"Teacher Added Successfuly"});
            }
        });
        
    });

    app.put('/updateTeacher',async (req,res)=>{
        const {tid,tname,tage,tdate,tmail/*,tclass*/} = req.body;  //,class_id = ?
        const que = 'UPDATE teachers SET name = ?, age = ?, joindate = ?, email = ? WHERE teacher_id = ?';

        db.query(que,[tname,tage,tdate,/*tsubject,*/tmail,/*tclass,*/tid],(err,result)=>{
            if (err) {
                res.json({status:false,msg:'An internal server error occurred'});
                console.log(err);
            }
            else res.json({status:true,msg:'Teacher data updated successfuly'});
        });
    });

    app.delete('/deleteTeacher',async (req,res) =>{
        const teacher_id = Number(req.query.id);
        const teacher_name = req.query.name ;


        const preque = `DELETE from login_credentials where username = (select username from teachers where teacher_id = ? and name = ?)`
        
        db.query(preque,[teacher_id,teacher_name],(err,result)=>{
            if (err) {
                return res.status(500).send('Error deleting teacher');
            }
        });

        db.query(`select count(*) as count from teacher_assignments where teacher_id = ? group by teacher_id`,[teacher_id],(err,result)=>{
            console.log(result[0].count);
            if (err) {
                console.log(err);
                return res.status(500).send("Error deleting teacher");
            
            }
            if (result[0].count>0) return res.send(500).send("This teacher has many subjects assigned cannot delete this teacher."); 
        });

        const querydelete = 'DELETE FROM teachers WHERE teacher_id = ? AND name = ?'
        db.query(querydelete , [teacher_id ,teacher_name] , (err, result)=>{
            if (err) {
                if (err.errno==1451) {
                    console.log(err);
                    return res.status(500).send('This teacher have assigned many classes to them which prevents teacher data deletion because of data safety.');
                }
                else return res.status(500).send('Error deleting teacher')
            } 
            if (result.affectedRows === 0)
            return res.status(404).send('Teacher not found or ID / Name mismatch');
            
            res.status(200).send('Teacher Deleted Successfully');
            
        });	
    });
}