const cron = require('node-cron');
const db = require('./db'); // must be promise pool

module.exports = () => {
  cron.schedule('*/1 * * * *', async () => {
    console.log('⏰ Running login credentials generation job...');

    try {
      const [result] = db.query(`
        INSERT INTO login_credentials (username, password_hash, role, profile_pic)
        SELECT
            username,
            CONCAT(username, FLOOR(1000 + RAND() * 9000)) AS password_hash,
            'student' AS role,
            CONCAT('uploads/', username, '.jpg') AS profile_pic
        FROM students
        WHERE created_at >= NOW() - INTERVAL 1 HOUR
      `);
        console.log(result);
      console.log(`✅ Login credentials generated for ${result.affectedRows} students`);
    } catch (err) {
      console.error('❌ Error generating login credentials:', err);
    }
  });
};
