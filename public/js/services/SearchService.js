'use strict';

//Articles service used for articles REST endpoint
angular.module('SearchService', []).factory('SearchService',[ '$http', function($http) {



	return { 
		getNear: function (lat, lon) {
		
			return $http({
				url: '/api/restaurantNear/'+ lat + '/' + lon,
				method: 'GET',
				header: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
			});
		},
		getTextForm: function () {
			return $http({
				url: '/api/getTextInput',
				method: 'GET',
			});
		},
		getSelectForm: function () {
			return $http({
				url: '/api/getSelectInput',
				method: 'GET',
			});
		},
		postData: function (formData) {
			//console.log(formData);
			return $http({
				url: '/api/search',
				data: JSON.stringify(formData),
				method: 'POST',
				header: {'Content-Type':'application/json'}
			});
		}
	}

	// }

}]);