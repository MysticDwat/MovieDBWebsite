//import mongoose and crypto packages
const mongoose = require("mongoose");
const crypto = require("crypto");

//schema for user model
const userSchema = new mongoose.Schema({
    //user name
    fname: {type: String, required: true},
    lname: {type: String, required: true},
    //user email
    email: {type: String, unique: true, required: true},
    //user password hash/salt
    hash: String,
    salt: String,
    //user confirmation
    confirmed: {type: Boolean, required: true},
    confirmationId: String,
    //user favorite movies
    favorites: Array
});

//function to set user password
userSchema.methods.setPw = function (pw){
    //create salt from 16 random bytes
    this.salt = crypto.randomBytes(16).toString('hex');
    //create hash of password from salt
    this.hash = crypto.pbkdf2Sync(pw, this.salt, 1000, 64, 'sha512').toString('hex');
}

//function to validate password
userSchema.methods.validPw = function (pw){
    //use salt to recreate hash
    let hash = crypto.pbkdf2Sync(pw, this.salt, 1000, 64, 'sha512').toString('hex');
    //compare hashes and return result
    return this.hash === hash;
}

//function to set confirmation id
userSchema.methods.setConfirmationId = function (){
    //create confirmation id from 16 random bytes
    this.confirmationId = crypto.randomBytes(16).toString('hex');
}

//mongo model from schema
const User = new mongoose.model('User', userSchema);

//export model
module.exports = {User};
