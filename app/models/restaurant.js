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
    }
});

	
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
