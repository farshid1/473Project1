'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Resturant Schema
 */
var RestaurantSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    url: {
    	type: String,
    	trim: true
    },
    distance: {
    	type: String,
    	trim: true
    },
    rating_img_url: {
    	type: String,
        trim: true
    },
    review_count: {
        type: String,
        trim: true
    },
    address_display: [],
    location: [Number],
    city: {
        type: String,
        trim: true
    },
    postal_code : {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    }
});

/**
 * Index Location
 */
RestaurantSchema.index({location: '2d'});	
/**
 * Statics
 */
RestaurantSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').exec(cb);
};


//We should add the last argument to link the model to our collection
var Restaurant = mongoose.model('Restaurant', RestaurantSchema, 'restaurants');
module.exports = Restaurant;
