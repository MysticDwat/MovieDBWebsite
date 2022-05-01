//import mongoose package
const mongoose = require("mongoose");

//schema for movie model
const movieSchema = new mongoose.Schema({
    //poster image url
    image: String,
    //movie title (primary key)
    title: {type: String, unique: true, required: true},
    //movie rating, duration, release date, and plot
    rating: Number,
    duration: Number,
    date: Date,
    plot: String,
    //list of genres and actors
    genres: Array,
    actors: Array
});

//mongo model from schema
const Movie = new mongoose.model('Movie', movieSchema);

//export model
module.exports = {Movie};