import mongoose from "mongoose" 
import 'dotenv/config' ;


const dbUrl = process.env.DBURL;

export async function main() {
    mongoose.connect(dbUrl)
}


