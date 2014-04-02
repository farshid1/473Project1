angular.module('MainCtrl',['geolocation', 'MainService']).controller('MainController',['$scope', 'geolocation', 'MainService', 

				function($scope, geolocation, MainService) {

	

 


	$scope.load = function () {
		// console.log(typeof($scope.coords),'from controller');
		geolocation.getLocation().then(function(data){
			//$scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};
			MainService.getNear(data.coords.latitude, data.coords.longitude)
			.then(
				function(r) {
					
					$scope.restaurants = r.data;
					//console.log($scope.restaurants);
					alert('data loaded');
				},
				function () {
					alert('failed')
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