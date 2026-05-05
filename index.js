import dotenv from 'dotenv'
import { app } from './app.js'
import { verifyDbConnection } from './db/db.js';
dotenv.config({
    path : '.env',
})


const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID || "app1";



const startServer = async () => {
    try {
        await verifyDbConnection();
        console.log("The Database is Connected");
        app.listen(PORT, () => {
            console.log(`Server ${SERVER_ID} running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
};

await startServer();