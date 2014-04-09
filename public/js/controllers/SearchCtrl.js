'use strict';

angular.module('SearchCtrl',['SearchService']).controller('SearchController',['$scope', 'SearchService', 

				function($scope, SearchService) {


	$scope.master = {};
	$scope.map = {};
	$scope.load = function () {
		
		SearchService.getTextForm()
		.then(
			function(r) {
				$scope.formTextData = r.data;
				//alert('data loaded');
			},
			function () {
				alert('failed')
			}
		);
		SearchService.getSelectForm()
		.then(
			function(r) {
				
				$scope.formSelectData = r.data;
				//alert('data loaded');
			},
			function () {
				alert('failed')
			}
		);

	};

	// Search Resul
	$scope.restaurants = {};
	$scope.formData = {};

	$scope.submit = function (formData) {
		$scope.master = angular.copy(formData);
		console.log($scope.master);
		delete $scope.formData;
		
		SearchService.postData($scope.master)
		.then(
			function(r) {
				console.log(r.data);
				var len = r.data.length;
                for (var i = len - 1; i >= 0; i--) {

                    $scope.map[r.data[i].phone] = {
                        latitude: r.data[i].location[1],
                        longitude: r.data[i].location[0]
                    };

                }
				$scope.restaurants = angular.copy(r.data);
				//alert('data loaded');
			},
			function () {
				alert('failed')
			}
		);
	};
	$scope.resetForm = function () {
		$scope.formData = {};
	};


	$scope.resetForm();

	
}]);