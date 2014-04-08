'use strict';

angular.module('SearchCtrl',['SearchService']).controller('SearchController',['$scope', 'SearchService', 

				function($scope, SearchService) {


	$scope.master = {};
	$scope.searchby = ['City', 'ZIP', 'Category'];
	$scope.load = function () {
		
		SearchService.getTextForm()
		.then(
			function(r) {
				
				$scope.formTextData = r.data;
				console.log($scope.formTextData);
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
				//console.log($scope.formSelectData);
				//alert('data loaded');
			},
			function () {
				alert('failed')
			}
		);

	};

	$scope.submit = function (formData) {
		$scope.master = angular.copy(formData);
		delete $scope.formData;
		$scope.formData = {};
		SearchService.postData($scope.master)
		.then(
			function(r) {
				
				console.log(r);
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