import mongoose from "mongoose" 
import 'dotenv/config' ;


const dbUrl = process.env.DBURL;

async function main() {
    mongoose.connect(dbUrl)
}


module.exports = {main} ;