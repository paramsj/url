import dotenv from 'dotenv'
import { app } from './app.js'
import { verifyDbConnection } from './db/db.js';
dotenv.config({
    path : '.env',
})

const startServer = async () => {
    try {
        await verifyDbConnection();
        console.log("The Database is Connected");
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
};

await startServer();