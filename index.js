//import express and dotenv package
const express = require('express');
require('dotenv').config();

//import models and session
const {User} = require("./modules/UserSchema.js");
const {Movie} = require("./modules/MovieSchema.js");
let {Session} = require("./modules/Session.js");

//import functions
const {sendConfirmationEmail} = require("./modules/ConfirmationMailer");
const {connect,loadMovies,checkName,checkPw} = require("./modules/MongooseFuncs.js");

//initialize mongodb
connect().catch((err) => console.log(err));
loadMovies().catch((err) => console.log(err));

//create app and set port
const app = express();
const PORT = process.env.PORT || 3001;
const path = __dirname + '/client/build/';

//parse json and url data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//use session
app.set('trust proxy', 1);
app.use(Session);

//serve statics
app.use(express.static(path));

//post request to register new user
app.post("/api/users/register", async (req, res) => {
    //store data in req.body
    let data = req.body;

    //if first or last name are invalid, ask for valid names.
    if(data.fname === '' || data.lname === '' || !checkName(data.fname) || !checkName(data.lname)){
        res.status(400).json({message: "Please enter a valid first and last name (a-z,A-Z)."}).end();

    //if email is invalid, ask for valid email.
    }else if(data.email === '' || !data.email.includes('@')){
        res.status(400).json({message: "Please enter a valid email."}).end();

    //if pw is not equal to confirm pw, ask for confirm pw to match pw
    }else if(data.pw !== data.confirmPw) {
        res.status(400).json({message: "Confirm password must match password."}).end();

    //if pw is invalid, ask for valid pw
    }else if(data.pw === '' || data.pw.length < 8 || !checkPw(data.pw)){
        res.status(400).json({
            message: "Please enter a valid password with at least 8 characters (a-z,A-Z,0-9,^,_,*,@,&,$,#,%,!)."
        }).end();

    //else create new user
    }else{
        //make new user doc using data
        let newUser = new User({
            fname: data.fname,
            lname: data.lname,
            email: data.email,
            salt: '',
            hash: '',
            confirmed: false,
            favorites: []
        });

        //set password hash/salt and confirmation id
        await newUser["setPw"](data.pw);
        await newUser["setConfirmationId"]();

        //attempt saving doc
        await User.create(newUser, async (err, doc) => {
            //if duplicate, indicate email has already registered
            if(err && err.code === 11000){
                res.status(500).json({message: "Email is already registered."}).end();

            //if any other error, indicate server error
            } else if(err){
                console.log(err);
                res.status(500).json({message: "Server failed to register user."});

            //else send confirmation email
            } else{
                //send email with confirmation link
                let emailSent = await sendConfirmationEmail(doc.email,
                    `${req.get("x-forwarded-proto")}://${req.get("x-forwarded-host")}` +
                        `/users/${doc._id}/confirm/${doc.confirmationId}`);

                //if email was sent, indicate success
                if(emailSent){
                    res.status(200).json({
                        message: `New user has been registered. Please check your inbox at ${data.email} to confirm your account.`
                    }).end();

                //else indicate server error
                }else{
                    res.status(500).json({message: "Server failed to send confirmation email."});
                }
            }
        });
    }
});

//post request to login
app.post("/api/users/login", async (req, res) => {
    //store data in req.body
    let data = req.body;

    //if email or pw are invlaid, ask for valid email and pw
    if(data.email === '' || data.pw === '' || !data.email.includes('@') || !checkPw(data.pw)){
        res.status(400).json({message: "Please enter a valid email and password."}).end();

    //else look up user by email
    }else{
        try{
            //find user by email
            let doc = await User.findOne({email: data.email}).orFail();

            //if incorrect pw, indicate incorrect email or password
            if(!await doc["validPw"](data.pw)){
                res.status(400).json({message: "Your email or password is incorrect."}).end();

            //if not confirmed, deny login and ask for confirmation of email
            }else if(!doc["confirmed"]) {
                res.status(401).json({
                    message: "Please confirm your account through the email sent to your email address."
                });

            //else login user
            }else{
                req.session.userid = doc["_id"];
                res.status(200).json({message: "User has been logged in."}).end();
            }

        //catch any errors
        }catch(err){
            console.log(err);

            //if no user found, indicate your email or password is incorrect
            if(err.name === "DocumentNotFoundError"){
                res.status(400).json({message: "Your email or password is incorrect."}).end();

            //else indicate server error
            }else{
                res.status(500).json({message: "Server failed to look up user."}).end();
            }

        }
    }
});

//get request to delete user
app.get("/api/users/delete", async (req, res) => {
    //if user is not logged in, indicate user is not logged in
    if(req.session.userid === undefined){
        res.status(400).json({message: "User not logged in."});

    //else delete user
    }else{
        try{
            //attempt to delete user
            let doc = await User.deleteOne({_id: req.session.userid});

            //if user does not exist, indicate user id not found
            if(!doc){
                res.status(404).json({message: "User id not found."}).end();

            //else logout user
            }else{
                req.session.userid = undefined;
                res.status(200).json({message: "Your account has been deleted."});
            }

        //catch any errors and indicate server error
        }catch(err){
            console.log(err);
            res.status(500).json({message: "Server failed to delete user."}).end();
        }
    }
});

//get request to retrieve user name
app.get("/api/users/name", async (req, res) => {
    //if user is not logged in, indicate user is not logged in
    if(req.session.userid === undefined){
        res.status(400).json({message: "User not logged in."});

    //else find user
    }else{
        try{
            //attempt to find user by id
            let doc = await User.findOne({_id: req.session.userid});

            //if user was not found, indicate user id was not found
            if(!doc){
                res.status(404).json({message: "User id not found."}).end();

            //else send first name
            }else{
                res.status(200).json({message: doc["fname"]}).end();
            }

        //catch any errors and indicate server error
        }catch(err){
            console.log(err);
            res.status(500).json({message: "Server failed to look up user."}).end();
        }

    }
});

//get request to fav or unfav movie
app.get("/api/users/:fav(unfav|fav)/:id", async (req, res) => {
    //store url parameters in params
    let params = req.params;

    //if user is not logged in, indicate user is not logged in
    if(req.session.userid === undefined){
        res.status(400).json({message: "User is not logged in."});

    //else find movie
    }else{
        try{
            //attempt to find movie by id
            let doc = await Movie.findOne({_id: params["id"]});

            //if movie not found, indicate movie id not found
            if(!doc){
                res.status(404).json({message: "Movie id not found."});

            //else update user favs
            }else{
                //if get request at users/fav, fav movie
                if(params["fav"] === "fav"){
                    doc = await User.updateOne(
                        {_id: req.session.userid},
                        {$push: {favorites: params["id"]}}
                    );

                //if get request at users/unfav, unfav movie
                }else{
                    doc = await User.updateOne(
                        {_id: req.session.userid},
                        {$pull: {favorites: params["id"]}}
                    );
                }

                //if update failed, indicate used id not found
                if(!doc){
                    res.status(404).json({message: "User id not found."}).end();

                //else indicate success
                }else{
                    res.status(200).json({message: "Favs has been updated."}).end();
                }
            }

        //catch any errors and indicate server error
        }catch(err){
            console.log(err);
            res.status(500).json({message: "Server could not look up user or movie."});
        }
    }
});

//get request to retrieve favorite movie ids
app.get("/api/users/favs", async (req, res) => {
    //if user is not logged in, indicate user is not logged in
    if(req.session.userid === undefined){
        res.status(400).json({message: []});

    //else get fav movies
    }else{
        try{
            //attempt to find user by id
            let doc = await User.findOne({_id: req.session.userid});

            //if user not found, indicate user id not found
            if (!doc) {
                res.status(404).json({message: "User id not found."}).end();

                //else get fav movies
            } else {
                //list to store movie info
                let movies = [];

                //for each movie id in favorites, find movie
                for (let i in doc["favorites"]) {
                    //attempt to find movie by id
                    let movieDoc = await Movie.findOne({_id: doc["favorites"][i]});

                    //if movie was not found, indicate movie id not found
                    if (!movieDoc) {
                        res.status(404).json({message: "Movie id not found."});

                        //else add movie to movies
                    } else {
                        movies = [...movies, movieDoc];
                    }
                }

                //send movies
                res.status(200).json({message: [...movies]});
            }

        //catch any errors and indicate server error
        }catch(err){
            console.log(err);
            res.status(500).json({message: "Server failed to look up user or movie."}).end();
        }
    }
});

//get request to confirm user
app.get("/api/users/:id/confirm/:code", async (req, res) => {
    //store url params in params
    let params = req.params;

    //if params are not of valid length, indicate user id or confirmation code not found
    if(params["code"].length !== 32 || params["id"].length !== 24){
        res.status(404).json({message: "User id or confirmation code not found."});

    //else find user
    }else{
        try{
            //attempt to find user by id
            let doc = await User.findOne({_id: params["id"]});

            //if user not found or confirmation code does not match,
            //indicate user id or confirmation code not found
            if(!doc || doc["confirmationId"] !== params["code"]){
                res.status(404).json({message: "User id or confirmation code not found."}).end();

            //if already confirmed, indicate account is confirmed
            }else if(doc["confirmed"]){
                res.status(200).json({message: "Your account has already been confirmed."});

            //else update user
            }else{
                //attempt to update user by id confirmation status
                doc = await User.updateOne({_id: params["id"]}, {confirmed: true});

                //if user not found, indicate user id or confirmation code not found
                if(!doc){
                    res.status(404).json({message: "User id or confirmation code not found."}).end();

                //else indicate success
                }else{
                    res.status(200).json({
                        message: "Your account has been confirmed and you can now login."
                    }).end();
                }
            }

        //catach any errors and indicate server error
        }catch(err){
            console.log(err);
            res.status(500).json({message: "Server failed to look up user."}).end();
        }
    }
});

//get request to retrieve list of all genres
app.get("/api/movies/genres", async (req, res) => {
    try{
        //attempt to get list of distinct genre entries
        let docs = await Movie.distinct('genres', {});

        //if no genres found, indicate empty db
        if(!docs) {
            res.status(404).json({message: "No genre was found."}).end();

        //else return list
        }else{
            res.status(200).json({message: [...docs]});
        }

    //catch any errors and indicate server error
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Server failed to get genres."});
    }
});

//get request to retrieve top 10 movies by genre
app.get("/api/movies/genres/:genre", async (req, res) => {
    //store url params in params
    let params = req.params;

    try{
        //attempt to find movie by genre, sort by desc rating, limit to 10 movies
        let docs = await Movie.find(
            {genres: {$regex: `^${params["genre"]}$`, $options: 'i'}},
            null,
            {sort:{rating: -1}, limit: 10}
        );

        //if no movies found, indicate genre not found
        if(!docs){
            res.status(404).json({message: "Genre was not found."}).end();

        //else send movie data
        }else {
            res.status(200).json({message: [...docs]});
        }

    //catch any error and indicate server error
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Server failed to get movies."});
    }
});

//get request to see if movie is favorited by user
app.get("/api/movies/fav/:id", async (req, res) => {
    //store url params in params
    let params = req.params;

    //if user not logged in, indicate user not logged in
    if(req.session.userid === undefined){
        res.status(400).json({message: "User is not logged in."});

    //else find movie
    }else{
        try{
            //attempt to find movie by id
            let doc = await Movie.findOne({_id: params["id"]});

            //if movie was not found, indicate movie id not found
            if(!doc){
                res.status(404).json({message: "Movie id not found."});

            //else find user
            }else{
                //attempt to find user by id
                doc = await User.findOne({_id: req.session.userid});

                //if user not found, indicate user id not found
                if(!doc){
                    res.status(404).json({message: "User id not found."}).end();

                //else send fav status
                }else{
                    res.status(200).json({message: doc["favorites"].includes(params["id"])}).end();
                }
            }

        //catch any error and indicate server error
        }catch(err){
            console.log(err);
            res.status(500).json({message: "Server could not look up user or movie."});
        }
    }
});

//get request to retrieve movie info
app.get("/api/movies/:id", async (req, res) => {
    //store url params in params
    let params = req.params;

    try{
        //attempt to find movie by id
        let doc = await Movie.findOne({_id: params["id"]});

        //if movie was not found, indicate movie id not found
        if(!doc){
            res.status(404).json({message: "Movie id not found."});

        //else send movie data
        }else{
            res.status(200).json({message: doc});
        }

    //catch any errors and indicate server error
    }catch(err){
        console.log(err);
        res.status(500).json({message: "Server failed to look up movie."});
    }
});

//serves react build
app.get('/', function (req,res) {
  if(process.env.NODE_ENV === "production"){
     res.sendFile(path + "index.html");
  }
});

//open app on port
app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
