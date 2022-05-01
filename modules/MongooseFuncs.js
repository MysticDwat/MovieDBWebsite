//import mongoose, fs, dotenv packages
const mongoose = require("mongoose");
const fs = require('fs');
require('dotenv').config();

//import movie model
const {Movie} = require("./MovieSchema.js");

//connect to the database
async function connect(){
    await mongoose.connect(process.env.URI).catch((err) => console.log(err));
}

//populates movie with data from movies.json
async function loadMovies(){
    //if movie is empty, populate
    if(await Movie.estimatedDocumentCount() <= 0){
        //get raw data from file and parse into json
        let rawData = fs.readFileSync('movies.json').toString();
        let movies = JSON.parse(rawData);

        //array to store new docs
        let movieDocs = [];

        //for each movie, create doc
        for(let i in movies){
            try{
                //create doc using movie data
                let newMovieDoc = new Movie({
                    image: movies[i]["info"]["image_url"],
                    title: movies[i]["title"],
                    duration: movies[i]["info"]["running_time_secs"],
                    date: movies[i]["info"]["release_date"],
                    plot: movies[i]["info"]["plot"],
                    genres: movies[i]["info"]["genres"],
                    actors: movies[i]["info"]["actors"]
                });

                //if movie data has rating field, store rating
                if(movies[i]["info"].hasOwnProperty("rating")){
                    newMovieDoc["rating"] = movies[i]["info"]["rating"];
                }

                //add doc to array
                movieDocs = [...movieDocs, newMovieDoc];
            }catch(err){
                console.log(err);
                console.log(movies[i]);
            }
        }

        //insert new docs into movie
        await Movie.insertMany(movieDocs).catch((err) => console.log(err));
    }
}

//function to check if name is valid
function checkName(name){
    //for each char in string
    for(let i = 0; i < name.length; i++){
        //get char code
        let code = name.charCodeAt(i);

        //if not a-z or A-Z, return false
        if(!(code > 64 && code < 91) && !(code > 96 && code < 123)){
            return false;
        }
    }

    //return true if all chars are valid
    return true;
}

//function to check if password is valid
function checkPw(pw){
    //for each char in string
    for(let i = 0; i < pw.length; i++){
        //get char code
        let code = pw.charCodeAt(i);

        //if not a-z, A-Z, 0-9, ^, _, *, @, &, $, #, %, ! return false
        if ((!(code > 47 && code < 58) &&
                !(code > 64 && code < 91) &&
                !(code > 96 && code < 123) &&
                !(code === 94 || code === 95) &&
                !(code === 42 || code === 64) &&
                !(code > 32 && code < 38)) ||
            code === 34 || code > 123){
            return false;
        }
    }

    //return true if all chars are valid
    return true;
}

//export functions
module.exports = {connect, loadMovies, checkPw, checkName};
