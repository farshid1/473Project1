angular.module('MainCtrl',['geolocation', 'MainService']).controller('MainController',['$scope', 'geolocation', 'MainService', 

				function($scope, geolocation, MainService) {

	

 

	$scope.map = {};
	$scope.load = function () {
		// console.log(typeof($scope.coords),'from controller');
		geolocation.getLocation().then(function(data){
			//$scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};
			console.log(data);
			MainService.getNear(data.coords.latitude, data.coords.longitude)
			.then(
				function(r) {
					//console.log(r.data[0].location);
					$scope.restaurants = r.data;
					$scope.restaurants.location = {};
					var len = r.data.length;
					for (var i = len- 1; i >= 0; i--) {

						$scope.map[r.data[i].phone] = {
							latitude: r.data[i].location[1],
							longitude: r.data[i].location[0]
						};

						// $scope.restaurants.location = {
						// 	latitude: r.data[i].location[1],
						// 	longitude: $scope.restaurants.location[0]
						// }
					}
					//console.log($scope.restaurants);
					//alert('data loaded');
				},
				function () {
					//alert('failed')
				}
			);
			});
		
		// MainService.get()
		// .then(
		// 	function(r) {
				
		// 		$scope.restaurants = r.data;
		// 		console.log($scope.restaurants);
		// 		alert('data loaded');
		// 	},
		// 	function () {
		// 		alert('failed')
		// 	}
		// );
	};


	
}]);