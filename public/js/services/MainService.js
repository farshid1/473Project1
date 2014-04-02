'use strict';

//Articles service used for articles REST endpoint
angular.module('MainService', []).factory('MainService',['$http','$q', function( $http, $q) {



	return {
		getNear: function(lat, lon) {
			console.log('/api/restaurantNear/'+ lat + '/' + lon);
			console.log(lat, lon, 'from service' );
			return $http({
				url: '/api/restaurantNear/'+ lat + '/' + lon,
				method: 'GET',
				header: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
			});
		}
	}
/*
 *	Here is a common way to connect to the API
 */
	// return {
	// 	// call to get all nerds
	// 	get : function() {
	// 		return $http.get('/api/restaurant');
	// 	},

	// 	// call to POST and create a new geek
	// 	create : function(geekData) {
	// 		return $http.post('/api/geeks', geekData);
	// 	},

	// 	// call to DELETE a geek
	// 	delete : function(id) {
	// 		return $http.delete('/api/geeks/' + id);
	// 	}
	// }

}]);