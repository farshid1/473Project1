'use strict';
var yelp = require("yelp").createClient({
  consumer_key: "8kyMN4wPw3x09oFUfUUa0Q", 
  consumer_secret: "HWrz5r-DEm1Wld19O4xlj-qdNFo",
  token: "dmUqaJU26BeKpAZKLxQoKJpk6fCVDyfi",
  token_secret: "eussWiSv84Q0vCYM8gMcdNq25S4"
});

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Restaurant = require('../models/restaurant.js');


/**
 * List of All Restaurants
 */
exports.all = function(req, res) {
    Restaurant.find({},function(err, restaurants) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(restaurants);
        }
    });
};


/**
 * List of Restaurants close by
 */
exports.near = function(req, res) {
    
    var term = req.params.lat +','+ req.params.lon;
    console.log(term);
    //var coords = req.body.coords.lon + ',' + req.body.coords.lat;
    //console.log(coords,'coords from node');
    yelp.search({term: "food", ll: '33.90867,-117.87970', limit: 20}, function(err, data) {
        if (err)  console.log(err);
        //console.log(data,'data from yelp');
        res.jsonp(data.businesses);
    });

    // Restaurant.find({},function(err, restaurantsNear) {
    //     if (err) {
    //         res.render('error', {
    //             status: 500
    //         });
    //     } else {
    //         res.jsonp(restaurantsNear);
    //     }
    // });
};

/**
 * Find top restaurants
 */
exports.top = function(req, res, next, id) {

};



/**
 * Show a resturaunt
 */
exports.show = function(req, res) {
    res.jsonp(req.article);
};


