'use strict';

/**
 * Module dependencies.
 */
var async = require('async'),
    geocoder = require('geocoder'),
    mongoose = require('mongoose'),
    Restaurant = require('../models/restaurant.js'),
    _ = require('underscore'),
    yelp = require("yelp").createClient({
        consumer_key: "8kyMN4wPw3x09oFUfUUa0Q",
        consumer_secret: "HWrz5r-DEm1Wld19O4xlj-qdNFo",
        token: "dmUqaJU26BeKpAZKLxQoKJpk6fCVDyfi",
        token_secret: "eussWiSv84Q0vCYM8gMcdNq25S4"
    }),
    MTR_TO_MILE = 0.000621371192;



 var getPostCoord = function (callback) {
    //console.log(req, "request from waterfall");
    var ll = req.params.lon + ',' + req.params.lat;
    callback(null, ll);
};
var getYelpData = function (ll, callback) {
    //console.log(ll, "ll from waterfall");
    yelp.search({
        term: "restaurant",
        ll: ll,
        radius_filter: "1000", // 5 miles
        limit: 10
    }, function (err, data) {
        if (err) {
            callback(err)
        }
        callback(null, data);
    });
};
var queryYelpData = function (callback) {
    console.log('getting data from yelp');
    yelp.search({
        term: 'food',
        location: req.body.term,
        radius_filter: req.body.radius ? req.body.radius : "8000", // 5 miles
        limit: req.body.limit ? req.body.limit : 5
    }, function (err, data) {
        console.log(data,'location from yelp PLAIN');
        if (err) {
            callback(err);
        }
        console.log(data, "from queryYelpData");
        callback(null, data);
    });
};
var filterYelpData = function (data, callback) {
    //console.log(data, "data from yelp");
    var result = [];
    async.each(data.businesses,
        function (restaurant, callback) {
            var filteredRestaurant = {};
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
            //city
            filteredRestaurant.city = restaurant.location.city;
            //postal_code
            filteredRestaurant.postal_code = restaurant.location.postal_code;

            result.push(filteredRestaurant);

            callback();
        },
        function (err) {
            if (err) {
                callback(err);
            }
            callback(null, result);
        }
    );
};
var getCoordFromGoogle = function (result, callback) {
    var finalResult = [];
    async.each(result,
        function (item, callback) {
            async.waterfall([
                function (callback) {
                    geocoder.geocode(item.address_display[0] + item.address_display[1],
                        function (err, data) {
                            if (err) {
                                callback(err);
                            }
                            if (data.status !== 'OVER_QUERY_LIMIT') {
                                item.location = [];
                                item.location.push(data.results[0].geometry.location.lng);
                                item.location.push(data.results[0].geometry.location.lat);
                            } else {
                                // google has a limit on the number of requests per rime 
                                setTimeout(function () {
                                    console.log('waiting for google api');
                                }, 1000)
                            }
                            callback(null, item);
                        }
                    );
                },
                function (item, callback) {
                    finalResult.push(item);
                    callback(null, finalResult);
                }
            ],
            function (err, result) {
                if (err) {
                    callback(err);
                }
                callback(null, result);
            }
            );
        },
        function (err) {
            if (err) {
                callback(err);
            }
            res.jsonp(finalResult);
            callback(null, finalResult);
        }
    );
    callback(null, finalResult);
};
var saveToDB = function (result, callback) {
    async.each(result,
        function (item, callback) {
            //some of the data have 
            if (!item.phone) item.phone = '';
            if (!item.postal_code) item.postal_code = '';
            if (!item.city) item.city = '';
            if (!item.category) item.category = '';
            Restaurant.update({
                phone: item.phone
            }, item, {
                upsert: true
            }, function (err) {
                if (err) {
                    callback(err);
                }
                callback();
            });
        },
        function (err) {
            if (err) {
                callback(err);
            }
        }
    );
};

/**
 * search restaurants
 */
var search = function(req, res) {
    async.waterfall([
        function (callback) {
            var condition = {};
            if (req.body.searchby === 'city') {
                condition.city = req.body.term;
            }
            else if (req.body.searchby === 'zip') {
                condition.postal_code = req.body.term;
            }
            //console.log(condition,'condition');
            callback(null, condition);
        }
        ,function (condition, callback) {
            console.log(condition,'condition');
            var query = Restaurant.find(condition).limit(req.body.limit ? req.body.limit : 5);
            query.exec(function (err, docs) {
                 if (err) {
                    throw err;
                }
                if (!_.isEmpty(docs)) {
                    res.jsonp(docs);
                } else {
                    async.waterfall([
                        //get data from yelp
                        queryYelpData(req, callback),
                        //filter Yelp data
                        filterYelpData(data, callback),
                        //get coordinates from google map
                        getCoordFromGoogle(result, callback),
                        //save to database
                        saveToDB(result, callback) 
                    ]); 
                }

            });
        }
    ]);

};
/**
 * List of Restaurants close by
 */
var near = function (req, res) {
    var query = Restaurant.find(
        { location :
           { "$near" : [parseFloat(req.params.lon) , parseFloat(req.params.lat)],
                "$maxDistance" : 500
           }
        }
    ).limit(10);
    query.exec(function (err, docs) {
            if (err) {
                throw err;
            }
            if (!_.isEmpty(docs)) {
                console.log('get data from mongodb');
                console.log(docs);
                res.jsonp(docs);
            } else {
                async.waterfall([
                    //get post coordinate
                    getPostCoord(callback),
                    //get yelp data
                    getYelpData(ll, callback),
                    // filter yelp data
                    filterYelpData(data, callback),
                    // get coordinates from google map
                    getCoordFromGoogle(result, callback),
                    // save to database
                    saveToDB(result, callback)
                ]); // End of main async.waterfall to get data from yelp

            } 
        }); 

};
exports.search = search;
exports.near = near;