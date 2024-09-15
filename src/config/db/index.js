const mongoose = require('mongoose')
// username: thefaceexample
// password mongodb atlas: 2inZu8B8TkGpLY3v
require('dotenv').config();
const url = process.env.URL
async function connection(){
    try {
        await mongoose.connect(url,{
            
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('Error connecting');
    }
}

module.exports = {connection};