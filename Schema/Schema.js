const Joi = require('Joi');

const schema = Joi.object({
    
title:Joi.string().required(),
imgUrl: Joi.string().required(),
director: Joi.string().required(),
writer:Joi.string().required(), 
cast: Joi.string().required(),
language: Joi.string().required(),
genre:Joi.string().required(),
description:Joi.string().required(),
imdbRating: Joi.string().required().min(0),
showtime:[
    Joi.string().required()
]
});


module.exports = schema;