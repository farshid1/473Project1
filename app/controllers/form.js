'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    TextInput = require('../models/form.js').TextInput,
    SelectInput = require('../models/form.js').SelectInput;


/**
 * List of All Text Inputs
 */
exports.textInput = function(req, res) {
    TextInput.find({},{'_id':0},function(err, inputs) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            console.log(inputs);
            res.jsonp(inputs);
        }
    });
};

/**
 * List of All Select Inputs
 */
exports.selectInput = function(req, res) {
    SelectInput.find({},{'_id':0},function(err, inputs) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            console.log(inputs);
            res.jsonp(inputs);
        }
    });
};


/**
 * List of Restaurants close by
 */
exports.near = function(req, res) {
    
    var term = req.params.lon +','+ req.params.lat;
    console.log(term);
    
    yelp.search({term: "food", ll: term, limit: 20}, function(err, data) {
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


