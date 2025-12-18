const db = require('./db');  // adjust relative path
const express = require('express');
const app = express();
app.use(express.json());
const path = require('path');

module.exports = (app) => {
    
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    app.get('/getProfilePic', async (req, res) => {
        const username = req.query.name;
        console.log(username);
        const que = `SELECT profile_pic FROM login_credentials WHERE username = ?`;
        db.query(que, [username], (err, result) => {
            if (err) {
                console.log('Error retrieving profile picture.');
                return res.status(500).json({ success: false, message: 'Error retrieving profile picture.' ,path:'uploads/user.png'});
            }
            if (result.length > 0) {
                const profilePicPath = result[0].profile_pic;
                console.log('Profile picture path:', profilePicPath);
                res.status(200).json({ success: true, path: profilePicPath });
            } else {
                res.status(404).json({ success: false, message: 'User not found.', path:'uploads/user.png' });
            }
        });
    });

//Ye default credentials wali request hai

app.post('/adduser' , (req,res) =>
{
     const {username , role , id }	= req.body;
     
     const upload = 'upload/' + username+ '.jpg'
     const password = (username + id + '123456').replace(/\s+/g, '');
     const query = 'INSERT INTO login_credentials VALUES (? , ? ,?,?)'
     
       db.query(query, [username, password, role, upload], (error, results) => {
        if (error) {
		 
		 return res.json({success:false , message:'Failed to add default user to database'}); 
		}
		return res.json({success : true , message: 'Success'}); });
});

//Change password request
app.post('/resetpassword' , (req,res) =>
{
    console.log('Hellow')
     const {username , password} = req.body;
     const query = 'UPDATE login_credentials SET password_hash = ? WHERE username = ?';
     db.query(query , [password, username] , (error , results) =>
    {
        if(error)
        return res.json({success: false , message:'Couldnot reset password'});
       
        return res.json({success:true , message:'Password Reset Successfully'});

    }); 
});



// Notices / Annoucments wali 


app.get('/posts' , (req,res) =>
{
    const audience = req.query.audience; 
    const xyz = 'all';
    const query = 'SELECT title , ndescription, audience FROM notices WHERE audience = ? or audience = ?'
    
    db.query(query , [audience,xyz] , (error , results) =>  
	{
	    if(error)
		    return res.json({success: false , message: 'No Notices to Show'});
        
        if(results.length === 0)
            return res.json({success: false , message: 'No Notices to Show'});
            
		return res.json({success: true , results});	
	});
		
});


    app.get('/studentsByClass',async (req, res) => {
        const class_id = req.query.class;
        if (class_id==0) {
            const que = `SELECT * FROM students`;
            
            console.log(class_id);
            db.query(que,(err, results) => {
                res.json(results);
                res.end;
            });
        }
        else {
            const que = `SELECT id,name,age,class,grade FROM students WHERE class_id = ? and class_id is not null`;
            
            console.log(class_id);
            db.query(que,[class_id],(err, results) => {
                res.json(results);
                //res.end;
            });
        }
    });

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
        return;
    }

    app.post('/addStudent',async (req, res) => {
        const {Name, Age, Class, Grade} = req.body;
        let que='';
        const dummmyUsername = 'abcdefgh'
        if (Class) {
            que = `INSERT INTO students (name, age, class_id, grade, class, username) VALUES (?, ?, ?, ?, ?, ?)`;
            const clss = stringifyClassId(Class);
            console.log(clss);
            db.query(que, [Name, Age, Class, Grade, clss, dummmyUsername], (err, result) => {
                if (err) {
                    console.log(err);
                    if (err.errno==1062) {
                        return res.status(500).json({message:'Student data already exists.'});
                    }
                    res.status(500).json({message:'Error adding student'});
                } else {
                    res.status(200).json({message:'Student added successfully'});
                }
            });
        }
        else {
            que = `INSERT INTO students (name, age, class_id, grade, username) VALUES (?, ?, ?, ?, ?)`;
            db.query(que, [Name, Age, null, Grade, dummmyUsername], (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({message:'Error adding student'});
                }
                else {
                    res.status(200).json({message:'Student added successfully'});
                }       
            });
        }
            
    });

    app.delete('/deleteStudent',async (req, res) => {
        const id = Number(req.query.id);
        const name = req.query.name;

        const preque = `DELETE from login_credentials where username = (select username from students where id = ? and name = ?)`;

        db.query(preque,[id,name],(err,result)=>{
            if (err) {
                console.log(err);
                return res.status(500).send('Error deleting student');
            }
        });

        const que = `DELETE FROM students WHERE id = ? AND name = ?`;
        db.query(que, [id, name], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Error deleting student.');
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Student not found or ID/Name mismatch.');
            }

            res.status(200).send('Student deleted successfully');
        });
    });

    const validTokens = [];

    app.post('/signin',async (req, res) => {
        const { u, p } = req.body;
        const que = `SELECT * from login_credentials WHERE username = ?`;
        db.query(que,[u],(err,result)=>{
            if (err) {
                console.log(err);
                console.log('Error retrieving results.');
                return res.status(500).json({success:false,message:'Login failed.'});
            }

            if (result.length>0) {
                const user = result[0];
                if (user.password_hash == p) {
                    const token = Math.random().toString(36).substring(2);
                    console.log(token);
                    validTokens.push(token);
                    res.status(200).json({
                        success: true,
                        token: token,
                        role: user.role,
                        message: 'Login successful'
                    });
                    //console.log(message);
                } 
                else {
                    res.status(401).json({  // 401 Unauthorized is better than 500
                        success: true,
                        message: 'Invalid Credentials'
                    });
                }
            }
        });
    });


    app.post('/validateToken',async (req, res) => {
        const { token } = req.body;
        const isValid = validTokens.includes(token);
        if (isValid) res.status(200).json({ valid: true });
        else res.status(401).json({ valid: false });
    });

    app.put('/updateStudent',async (req, res) => {
        const {ID, newName, newAge, newClass, newGrade} = req.body;
        const que = `UPDATE students SET name = ?, age = ?, grade = ?, class = ? WHERE id = ?`;

        db.query(que, [newName, newAge, newGrade, newClass, ID], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({message:'Error updating student'});
            } else {
                if (result.affectedRows === 0) {
                    return res.status(404).json({message:'Student not found'});
                }
                res.status(200).json({message:'Student updated successfully'});
            }
        });
    });
}