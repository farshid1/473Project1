'use strict';

//Articles service used for articles REST endpoint
angular.module('MainService', []).factory('MainService',['$http','$q', function( $http, $q) {



	return { 
		getNear: function(lat, lon) {
			return $http({
				url: '/api/restaurantNear/'+ lat + '/' + lon,
				method: 'GET',
				header: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
			});
		},
		getForm: function() {
			return $http({
				url: '/api/getForm',
				method: 'GET',
			});
		}
	}

}]);