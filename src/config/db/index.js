const mongoose = require('mongoose')
// username: thefaceexample
// password mongodb atlas: 2inZu8B8TkGpLY3v
async function connection(){
    try {
        await mongoose.connect('mongodb+srv://thefaceexample:2inZu8B8TkGpLY3v@cluster0.qorlu.mongodb.net/tao_bai_tap',{
            
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('Error connecting');
    }
}

module.exports = {connection};