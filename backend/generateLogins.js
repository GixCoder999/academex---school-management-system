const cron = require('node-cron');
const db = require('./db');

module.exports = () => {
  cron.schedule('*/1 * * * *', () => { // every minute
    console.log('⏰ Running login credentials generation job...');

    const sql0 = `UPDATE students set username = concat(replace(name,' ',''),id) where created_at >= NOW() - INTERVAL 1 HOUR`;

    db.query(sql0,(err,result)=>{
        if (err) {
            console.log(err);
            return;
        }
        console.log(result.affectedRows);
    })

    const sql = `
    INSERT INTO login_credentials (username, password_hash, role, profile_pic)
    SELECT
        username,
        CONCAT(username, FLOOR(1000 + RAND() * 9000)) AS password_hash,
        'student' AS role,
        CONCAT('uploads/', username, '.jpg') AS profile_pic
    FROM students
    WHERE created_at >= NOW() - INTERVAL 1 HOUR
    `;

    db.query(sql, (err, result) => {
      if (err) {
        console.error('❌ Error generating login credentials:', err);
      } else {
        console.log(`✅ Login credentials generated for ${result.affectedRows} students`);
      }
    });
  });
};
