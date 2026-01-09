const mongoose = require('mongoose');
const initData = require('../init/data.js');
const Listing = require('../models/listing.js');
const { initDB } = require('../models/user.js');

const MONGODB_URL = "mongodb://127.0.0.1:27017/vandanest";

main().then(() => {
    console.log('Database connection established');
})
    .catch(err => {
        console.error('Database connection error:', err);
    });

async function main() {
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB');
}

const initDB = async () => {
        await Listing.deleteMany({});
        initData.data = initData.data.map((obj) => ({
            ...obj,
            owner: "69576ba5366f83ef5a802fd1"
        }));
        await Listing.insertMany(initData.data);
        console.log('Sample listings inserted into the database');
    };

    initDB();