import mysql from 'mysql2/promise';

async function run() {
  const db = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'bdq_db' });
  try {
    await db.execute("ALTER TABLE medicine MODIFY COLUMN medicine_category ENUM('Tablet','Syrup','Capsule','Injection','Nebule','Sachet','Drops','Ointment') NOT NULL");
    console.log('Enum updated');
  } catch(e) {
    console.log(e.message);
  }
  process.exit(0);
}
run();
