'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    TextInput = require('../models/form.js').TextInput,
    SelectInput = require('../models/form.js').SelectInput,
    Restaurant = require('../models/restaurant.js');


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
            //console.log(inputs);
            res.jsonp(inputs);
        }
    });
};

/**
 * List of All Select Inputs
 */
exports.selectInput = function(req, res) {
    SelectInput.find({},function(err, inputs) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            //console.log(inputs[0].selectOptions);
            res.jsonp(inputs);
        }
    });
};


/**
 * submit search form
 */
var submit = function(req, res) {
    console.log(req.body, "params from body");

    // Restaurant.find({},)
    // res.redirect('/search');
};

exports.submit = submit;

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


