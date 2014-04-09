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


/**
 * search restaurants
 */

var search = function(req, res) {
    console.log(req.body);
    //res.jsonp(req.body);
    async.series([
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
    ],
    function (err, result) {
        //console.log(result[0],'condition');
        var query = Restaurant.find(result[0]).limit(req.body.limit ? req.body.limit : 5);
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
                    // get longtitude & latitude
                    function (callback) {
                        //console.log(req, "request from waterfall");
                        var ll = req.params.lon + ',' + req.params.lat;
                        callback(null, ll);
                    },
                    // get data from yelp
                    function (ll, callback) {
                        console.log(req.body.term,req.body.limit, "ll from waterfall");
                        console.log('get data from yelp');
                        yelp.search({
                            term: 'food',
                            location: req.body.term,
                            radius_filter: req.body.radius ? req.body.radius : "8000", // 5 miles
                            limit: req.body.limit ? req.body.limit : 5
                        }, function (err, data) {
                            if (err) {
                                callback(err)
                            }
                            callback(null, data);
                        });
                    },
                    // filter Yelp data
                    function (data, callback) {
                        //console.log(data.businesses, "data from yelp");
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
                    },
                    // get coordinates from google map
                    function (result, callback) {
                        //console.log(result, "from coordinates");
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
                                                        setTimeout(function () {
                                                            console.log('waiting for google api');
                                                        }, 2000)
                                                    }

                                                    //console.log(item);
                                                    callback(null, item);
                                                }
                                            );
                                        },
                                        function (item, callback) {

                                            //console.log(item,"item");
                                            finalResult.push(item);
                                            callback(null, finalResult);

                                        }
                                    ],
                                    function (err, result) {
                                        //console.log(item,'item from async each callback');
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
                                //console.log(finalResult,'final result finally*********************');
                                res.jsonp(finalResult);
                                callback(null, finalResult);
                            }
                        );
                        callback(null, finalResult);
                    },
                    // save to database
                    function (result, callback) {
                        //console.log(result, "from save to db");
                        async.each(result,
                            function (item, callback) {
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
                                //console.log(result, "from save to databasae");
                            }

                        );// end of async.each for saving data to db
                    }
                ]); // End of main async.waterfall to get data from yelp

            } // en
        });
    }
    );

};
exports.search = search;
/**
 * List of Restaurants close by
 */

var near = function (req, res) {
    var query = Restaurant.find({
            location: {
                '$near': [parseFloat(req.params.lon), parseFloat(req.params.lat)]
            }
        }).limit(10);
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

                    function (callback) {
                        //console.log(req, "request from waterfall");
                        var ll = req.params.lon + ',' + req.params.lat;
                        callback(null, ll);
                    },
                    function (ll, callback) {
                        //console.log(ll, "ll from waterfall");
                        yelp.search({
                            term: "restaurant",
                            ll: ll,
                            radius_filter: "8000", // 5 miles
                            limit: 10
                        }, function (err, data) {
                            if (err) {
                                callback(err)
                            }
                            callback(null, data);
                        });
                    },
                    // filter data from yelp
                    function (data, callback) {
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
                    },
                    // get coordinates from google map
                    function (result, callback) {
                        //console.log(result, "from coordinates");
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
                                                        setTimeout(function () {
                                                            console.log('waiting for google api');
                                                        }, 1000)
                                                    }

                                                    //console.log(item);
                                                    callback(null, item);
                                                }
                                            );
                                        },
                                        function (item, callback) {

                                            //console.log(item,"item");
                                            finalResult.push(item);
                                            callback(null, finalResult);

                                        }
                                    ],
                                    function (err, result) {
                                        //console.log(item,'item from async each callback');
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
                                //console.log(finalResult,'final result finally*********************');
                                res.jsonp(finalResult);
                                callback(null, finalResult);
                            }
                        );
                        console.log(finalResult, 'final result');
                        callback(null, finalResult);
                    },
                    // save to database
                    function (result, callback) {
                        //console.log(result, "from save to db");
                        async.each(result,
                            function (item, callback) {
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
                                //console.log(result, "from save to databasae");
                            }

                        );// end of async.each for saving data to db
                    }
                ]); // End of main async.waterfall to get data from yelp

            } // end of else
        }); // end of query exec callback

};
// Export the near method
exports.near = near;