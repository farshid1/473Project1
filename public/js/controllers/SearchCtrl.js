'use strict';

angular.module('SearchCtrl',['SearchService']).controller('SearchController',['$scope', 'SearchService', 

				function($scope, SearchService) {


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
					console.log($scope.formSelectData);
					//alert('data loaded');
				},
				function () {
					alert('failed')
				}
			);

	};


	
}]);