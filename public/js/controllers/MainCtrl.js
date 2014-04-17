angular.module('MainCtrl', ['geolocation', 'MainService']).controller('MainController', ['$scope', 'geolocation', 'MainService',

    function ($scope, geolocation, MainService) {

        $scope.restaurants = {};
        $scope.map = {};
        $scope.load = function () {
            geolocation.getLocation().then(function (data) {
                console.log(data);
                MainService.getNear(data.coords.latitude, data.coords.longitude)
                    .then(
                        function (r) {
                            $scope.restaurants = angular.copy(r.data);
                            $scope.restaurants.location = {};
                            var len = r.data.length;
                            for (var i = len - 1; i >= 0; i--) {

                                $scope.map[r.data[i].phone] = {
                                    latitude: r.data[i].location[1],
                                    longitude: r.data[i].location[0]
                                };

                            }

                        },
                        function () {
                            alert('failed');
                        }
                );
            });


        };



    }
]);