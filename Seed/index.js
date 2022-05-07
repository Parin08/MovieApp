const Movies = require('../models/movies');
const showTime = require('../models/Showtime');
const mongoose = require('mongoose');
const axios = require('axios');
const {movies} = require('../Seed/movies')

mongoose.connect('mongodb://localhost:27017/MovieApp',{
     useNewUrlParser: true,
     useUnifiedTopology: true
});


mongoose.connection.on('error', console.error.bind(console, 'connection error for database'));
mongoose.connection.once('open', function() {
    console.log('We are connected to database')
});


const movie = async function(mv,ShowTime) {
    try {
    const num =  Math.floor(Math.random() * 3);
      const response =  await axios.get(`https://www.omdbapi.com/?i=tt3896198&apikey=87aee58d&t=${mv}`);
        const movie1 = new Movies({
            title:response.data.Title,
            imgUrl:response.data.Poster,
            director:response.data.Director,
            writer:response.data.Writer,
            cast:response.data.Actors,
            language:response.data.Language,
            genre:response.data.Genre,
            description:response.data.Plot,
            imdbRating:response.data.imdbRating,
            showtime:ShowTime[num]._id,
            user:'623fab2e39ee38d2f5883f45'
        })
    
        movie1.save();

    } catch (error) {
      console.error(error);
    }
  }


const seedData = async ()=>{
    await Movies.deleteMany({});
    const ShowTime = await showTime.find({});     
        for(m of movies){
            movie(m,ShowTime);
        }
        

}

seedData();
