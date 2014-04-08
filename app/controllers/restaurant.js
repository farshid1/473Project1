'use strict';
var _ = require('underscore'),
    MTR_TO_MILE = 0.000621371192,
    yelp = require("yelp").createClient({
        consumer_key: "8kyMN4wPw3x09oFUfUUa0Q",
        consumer_secret: "HWrz5r-DEm1Wld19O4xlj-qdNFo",
        token: "dmUqaJU26BeKpAZKLxQoKJpk6fCVDyfi",
        token_secret: "eussWiSv84Q0vCYM8gMcdNq25S4"
    });

/**
 * Module dependencies.
 */
var async = require('async'),
    geocoder = require('geocoder'),
    mongoose = require('mongoose'),
    Restaurant = require('../models/restaurant.js');


/**
 * List of All Restaurants (We are not really using this, this is just a template )
 */
exports.all = function (req, res) {
    Restaurant.find({}, function (err, restaurants) {
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

/*
 search by  city
            zip
            category 
 filter by  limit,
            rank,
            radius           
 */

var saveRestaurant = function (err, data, restObject, phone, result) {
    if (err) throw err;

    //restObject.location.push(data.results[0].geometry.location.lng);
    //restObject.location.push(data.results[0].geometry.location.lat);
    //console.log(restObject);
    Restaurant.update({
        phone: phone
    }, restObject, {
        upsert: true
    }, function (err) {
        if (err) {
            throw err;
        }
        result.push(restObject);
    });

    //result.push(restObject);
    // console.log(result);

};

var getYelpData = function (err, data, res) {
    if (err) {
        throw err;
    }
    //console.log(data.businesses[0].location);
    var result = [];
    // we have to use async here because
    async.each(data.businesses,
        function (restaurant, callback){
            filterYelpData(restaurant, result);
            callback();
            //res.jsonp(result)
        },
        function (err) {
            if (err) throw err;
            console.log("Yelp request results:");
            console.log(result);
            //return response after results are filtered (async)
            res.jsonp(result);
        }
    );

};
var filterYelpData = function (restaurant, result) {

    var filteredRestaurant = {};
    //console.log(result);
    //name
    filteredRestaurant.name = restaurant.name;
    //url
    filteredRestaurant.url = restaurant.url;
    //distance
    filteredRestaurant.distance = (restaurant.distance * MTR_TO_MILE).toFixed(2);
    //rating_img_url
    filteredRestaurant.rating_img_url = restaurant.rating_img_url;
    //review_count
    filteredRestaurant.review_count = restaurant.review_count;
    //display_address
    filteredRestaurant.address_display = restaurant.location.display_address;
    //phone
    filteredRestaurant.phone = restaurant.phone;
    //category
    filteredRestaurant.category = restaurant.categories[0][0];

    // insert into the database after getting the 
    //ref: http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
    var rest = new Restaurant(filteredRestaurant),
        restObject = rest.toObject();
    delete restObject._id;
    result.push(restObject);

    geocoder.geocode(filteredRestaurant.address_display[0] + filteredRestaurant.address_display[1],
        function(err, data) {
            restObject.location.push(data.results[0].geometry.location.lng);
            restObject.location.push(data.results[0].geometry.location.lat);
            saveRestaurant(err, data, restObject, filteredRestaurant.phone, result);
        }
    );

};
var getRestaurants = function (err, docs, req, res) {

    if (err)
        throw err;
    if (_.isEmpty(docs)) {
        console.log('get data from mongodb');
        res.jsonp(docs);
        console.log("Mongo results:");
        console.log(docs);
    }
    // no result in the database, make a call to the yelp API
    else {
        console.log('get data from yelp API');
        var term = req.params.lon + ',' + req.params.lat;
        // we have to limit the result to 5 because of Google Maps API's OVER_QUERY_LIMIT error
        yelp.search({
            term: "food",
            ll: term,
            radius_filter: "8000", // 5 miles
            limit: 5
        },
        function (err, data) {
            getYelpData(err, data, res);
        });
    }
};

var near = function (req, res) {
    var query = {};
    if (req.body.zip) {
        query.zip = req.body.zip;
    }
    else if (req.body.city) {
        query.city = req.body.city;
    };
    Restaurant.find({
        location: {
            '$near': [parseFloat(req.params.lon), parseFloat(req.params.lat)]
        }
    }, function(err, data) {
        getRestaurants(err, data, req, res);
    });
};


// var near = function (req, res) {
//     Restaurant.find({
//         location: {
//             '$near': [parseFloat(req.params.lon), parseFloat(req.params.lat)]
//         }
//     }, 
//     function(err, data) {
//         if (err)
//             throw err;
//         if (!_.isEmpty(data)) {
//             console.log('get data from mongodb');
//             res.jsonp(data);
//         }
//         // no result in the database, make a call to the yelp API
//         else {
//             console.log('get data from yelp API');
//             var term = req.params.lon + ',' + req.params.lat;
//             // we have to limit the result to 5 because of Google Maps API's OVER_QUERY_LIMIT error
//             yelp.search({
//                 term: "food",
//                 ll: term,
//                 radius_filter: "8000", // 5 miles
//                 limit: 5
//             },
//             function (err, data) {
//                 if (err) {
//                     throw err;
//                 }
//                 //console.log(data.businesses[0].location);
//                 var result = [];
//                 // we have to use async here because
//                 _.each(data.businesses,
//                     function (restaurant){
//                         var filteredRestaurant = {};
//                         //name
//                         filteredRestaurant.name = restaurant.name;
//                         //url
//                         filteredRestaurant.url = restaurant.url;
//                         //distance
//                         filteredRestaurant.distance = (restaurant.distance * MTR_TO_MILE).toFixed(2);
//                         //rating_img_url
//                         filteredRestaurant.rating_img_url = restaurant.rating_img_url;
//                         //review_count
//                         filteredRestaurant.review_count = restaurant.review_count;
//                         //display_address
//                         filteredRestaurant.address_display = restaurant.location.display_address;
//                         //phone
//                         filteredRestaurant.phone = restaurant.phone;
//                         //category
//                         filteredRestaurant.category = restaurant.categories[0][0];

//                         // insert into the database after getting the 
//                         //ref: http://stackoverflow.com/questions/7267102/how-do-i-update-upsert-a-document-in-mongoose
//                         var rest = new Restaurant(filteredRestaurant),
//                             restObject = rest.toObject();
//                         delete restObject._id;

//                         geocoder.geocode(filteredRestaurant.address_display[0] + filteredRestaurant.address_display[1],
//                             function(err, data) {
//                                 if (err) throw err;

//                                 restObject.location.push(data.results[0].geometry.location.lng);
//                                 restObject.location.push(data.results[0].geometry.location.lat);

//                                 Restaurant.update({
//                                     phone: filteredRestaurant.phone
//                                 }, restObject, {
//                                     upsert: true
//                                 }, function (err) {
//                                     if (err) {
//                                         throw err;
//                                     }
//                                 });

//                                 result.push(restObject);
//                             }
//                         );
//                     },
//                     function (err) {
//                         if (err) throw err;
//                         res.jsonp(result);
//                     }
//                 );
//             });
//         }
//     });
// };
// Export the near method
exports.near = near;

/**
 * List of Restaurants close by
 */
exports.find = function (req, res) {

}

/**
 * Find top restaurants
 */
exports.top = function (req, res, next, id) {

};



/**
 * Show a resturaunt
 */
exports.show = function (req, res) {
    res.jsonp(req.article);
};