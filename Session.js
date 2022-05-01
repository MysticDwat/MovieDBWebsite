//import express-session, connect-mongo,
//dotenv, and csrf packages
const session = require("express-session");
let MongoStore = require('connect-mongo');
let Tokens = require('csrf');
require('dotenv').config();

//create new csrf instance, secret and token
let csrf = new Tokens();
let secret = csrf.secretSync();
//let state = csrf.create(secret);

//create session
let Session = session({
    store: MongoStore.create({ mongoUrl: process.env.URI}),
    secret: secret,
    cookie: { maxAge: 1000 * 60 * 60, sameSite: "lax"},
    saveUninitialized: true,
    resave: false
});

//export session
module.exports = {Session};