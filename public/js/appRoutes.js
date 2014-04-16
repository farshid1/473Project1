angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'MainController'
		})
		.when('/search', {
			templateUrl: 'views/search.html',
			controller: 'SearchController'	
		})
		;

	$locationProvider.html5Mode(true);

}]);