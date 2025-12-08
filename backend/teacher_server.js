const db = require('./db');  // adjust relative path

module.exports = (app) => {
    
    app.get('/teachers/t',async (req,res)=>{
        const u = req.query.username;
        console.log(u);

        const que = `select teacher_id as tid,name as tname from teachers where username = ?`;

        db.query(que,[u],(err,results)=>{
            if (err) res.json({status:false,message:'An internal server error occurred'});

            console.log(results);
            const tid = results[0].tid;
            const tname = results[0].tname;
            return res.json({tid,tname});
        });
    });

    app.get('/api/teachers/:teacherId' , (req, res) =>
    {
        const teacherid = req.params.teacherId ;
        console.log(teacherid);
        const query = `select ta.class_id, c.class_name from teacher_assignments ta, teachers t,classes c
                        where t.teacher_id = ta.teacher_id and 
                        c.class_id = ta.class_id and t.teacher_id = ?`;
        db.query(query , [teacherid] , (error , results) =>
        {
            if(error)
            {
                console.log(error);
                return res.status(500).json({success:false , message:'Could not fetch classes '});
            }
            console.log(results);
            if(results.length == 0)
            {
                return res.json({success:true , message: 'No classes found' , classess:[]});
            }
            return res.json({success:true , classes:results});
        });
    });

    app.get('/api/teachers/:teacherId/classes/:classNo/subjects' , (req , res) =>
    {
        const { teacherId, classNo } = req.params;
        console.log(teacherId,classNo);
        const query = 'select subject_code as subject from teacher_assignments where teacher_id=? and class_id=?';
        db.query(query , [teacherId, classNo], (error,  results) =>
        {
        if(error)
        {
            console.log(error);
            return res.status(500).json({success:false , message:'Could not fetch subjects '});
        }
        console.log(results);
        if(results.length == 0)
        {
            return res.json({success:true , message: 'No subjects found' , subjects:[]});
        }
        return res.json({success: true , subjects: results});
        });
    });

    app.get('/api/classes/:classNo/subjects/:subject_name/students' , (req , res) =>
    {
        const {classNo , subject_name} = req.params;
        console.log(classNo,subject_name);
        const query = 'SELECT * FROM exam_record where class_number = ? AND subject_name = ?';
    
        db.query(query , [classNo , subject_name] , (error , results) =>
        {
            if(error)
            {
                return res.status(500).json({success:false , message:'Could not fetch students '});
            }
            console.log(results);
            if(results.length == 0)
            {
                return res.json({success:true , message: 'No students found' , students:[]});
            }
            return res.json({success: true , students: results});
        });
    });

    app.post('/api/classes/:classNo/subjects/:subject_name/students/:studentId/marks' ,(req,res) =>
    {
        const {classNo , subject_name , studentId} = req.params;
        const {marks} = req.body;
        
        console.log(classNo,subject_name,studentId,marks);

        const query = 'UPDATE exam_record SET obtained_marks = ? WHERE class_number = ? AND subject_name = ? AND student_id = ?';
        db.query(query , [marks , classNo , subject_name , studentId] , (error , results) =>
        {
            if(error) {
                console.log(error);
                return res.status(500).json({success:false , message:'Could not update marks '});
            }

            console.log(results);
            return res.json({success: true , message: 'Marks edited successfully'});
        });
    });

}