import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        const session = await mongoose.startSession();
        console.log("Started session");
        await session.withTransaction(async () => {
            console.log("In transaction");
        });
        session.endSession();
        console.log("Transaction success");
    } catch (err) {
        console.error("Transaction failed:", err.message);
    }
    mongoose.disconnect();
}

check();
