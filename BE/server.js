require('dotenv').config();

const app = require('./src/app.js');
const pool = require('./src/config/db.js');

async function startServer() {
    try {
        await pool.query('SELECT 1');
        console.log('Database connection successful');
        const port = process.env.PORT || 1006;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
};

startServer();