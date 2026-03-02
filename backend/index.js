import express from "express";
import 'dotenv/config'

import {main}  from "./Services/Connections/db.connection.js"

let app = express();
const port = process.env.PORT || 8080;

main().then(()=>{
    console.log("Mongoosh is connected");
}).catch((err)=>{
    console.log("AN Error hs occured" , err);
});

app.listen( port, ()=>{
    console.log(`Server is listening to the port ${port}`);
});
