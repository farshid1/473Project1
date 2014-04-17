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

var getYelpData = function (ll, callback) {
    console.log('first callback called, get yelp data');
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
var queryYelpData = function (callback, req) {
    console.log('first callback called, query for yelp data');
    yelp.search({
        term: 'restaurant',
        location: req.body.term,
        radius_filter: req.body.radius ? req.body.radius : "8000", // 5 miles
        limit: req.body.limit ? req.body.limit : 5
    }, function (err, data) {
        if (err) {
            callback(err);
        }
        console.log(data.businesses[0]);
        callback(null, data);
    });
};
var filterYelpData = function (data, callback) {
    console.log('second callback called, filter Yelp data');
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
    console.log('third callback called, get coordinates from geocoder ');
    var finalResult = [];
    async.each(result,
        function (item, callback) {
            async.waterfall([
                function (callback) {
                    var address = "";
                    for (var i = 0; i < item.address_display.length; i++) {
                        address += item.address_display[i]
                    }
                    geocoder.geocode(address, function (err, data) {
                            if (err) {
                                callback(err);
                            }
                            console.log("deocoder status ",data.status);
                            // remember that some of the businesses from yelp don't have an address 
                            if (data.status !== 'OVER_QUERY_LIMIT' && data.status !== 'ZERO_RESULTS') {
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
            
            callback(null, finalResult);
        }
    );
};
var saveToDB = function (result, callback) {
    console.log('fourth callback called, save filtered data from Yelp to DB');
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
            callback(null, result);
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
                console.log(docs.length);
                if (err) {
                    throw err;
                }
                if (!_.isEmpty(docs)) {
                    console.log("Get searched restaurants from mongodb");
                    res.jsonp(docs);
                } else {
                    async.waterfall([
                        //get data from yelp
                        function (callback) {
                            queryYelpData(callback, req);
                        },
                        //filter Yelp data
                        filterYelpData,
                        //get coordinates from google map
                        getCoordFromGoogle,
                        //save to database
                        saveToDB 
                    ],
                    function(err, result) {
                        if (err) {
                            throw err;
                        }
                        res.jsonp(result);
                    }); 
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
            if (!_.isEmpty(docs) || docs.length > 10) {
                console.log('Get near restaurants from mongodb');
                res.jsonp(docs);
            } else {
                async.waterfall([
                    //get post coordinate
                    function (callback) {
                        var ll = req.params.lon + ',' + req.params.lat;
                        callback(null, ll);
                    },
                    //get yelp data
                    getYelpData,
                    // filter yelp data
                    filterYelpData,
                    // get coordinates from google map
                    getCoordFromGoogle,
                    // save to database
                    saveToDB
                ],
                function(err, result) {
                    if (err) {
                        throw err;
                    }
                    res.jsonp(result);
                }); // End of main async.waterfall to get data from yelp

            } 
        }); 

};
exports.search = search;
exports.near = near;