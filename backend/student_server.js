const db = require('./db');  

module.exports = (app)=> {
    app.get('/students' ,async (req,res) =>{
        let studentId = req.query.studentId;
        console.log(studentId);
        const query = 'SELECT * FROM students WHERE username = ?';
        
        db.query(query , [studentId] , (error , results) =>
        {
            if(error) return res.json({success:false , message: 'Coudlnot load student data'});
            console.log(results[0]);
            return res.json({success: true , student: results[0]});
        })
    });

    app.get('/classes/' ,async (req,res) =>
    {
        const classNo = req.query.classNo ;
        const query = 'select subject_id as subject_name,class_id from subjects where class_id = ?';

        db.query(query , [classNo] , (error,results) =>
        {
            if(error)
            return res.json({success:false , message: 'Could not load student data'});
            
            console.log(results);
            return res.json({success:true , subjects:results});

        });
    });


    app.get('/students/Exam_Data' , (req , res) =>
    {
        const studentId = req.query.studentId;
        const subject_name = req.query.subject_name;
        console.log(studentId,subject_name);
        const query = 'SELECT * FROM exam_record WHERE student_id = ? AND subject_name = ?';

        db.query(query , [studentId , subject_name] , (error,results) =>
        {
            if(error)
            return res.json({success:false , message: 'Couldnot load student data'});
            
            console.log(results);
            return res.json({success: true , exam:results});
        });
    });

}