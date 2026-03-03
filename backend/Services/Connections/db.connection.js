import mongoose from "mongoose" 
import 'dotenv/config' ;


const dbUrl = process.env.DBURL;

async function main() {
    if (!dbUrl) {
        throw new Error("DBURL is missing in environment variables");
    }

    await mongoose.connect(dbUrl);
}


export { main };
