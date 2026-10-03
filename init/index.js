require("dotenv").config({ path: "../.env" }); // ADD THIS

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");


// const dbUrl = process.env.ATLASDB_URL; // CHANGE
let dbUrl = "mongodb://127.0.0.1:27017/project";
main().then(() => {
    console.log("connect successfully");
}).catch(err => console.log(err));


async function main(){
    // await mongoose.connect("mongodb://127.0.0.1:27017/project");
     await mongoose.connect(dbUrl); // CHANGE
}

const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner : "69cd33e90aefd3b064e2a0da"}));
    await Listing.insertMany(initData.data);
    console.log("data was inserted");
}

initDB();