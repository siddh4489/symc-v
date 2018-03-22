angular.module('nibs.myaccount', ['openfb', 'nibs.status', 'nibs.activity', 'nibs.wallet'])

    // Routes
    .config(function ($stateProvider) {
        $stateProvider
             .state('app.myaccount', {
                 url: "/myaccount",
                 views: {
                     'menuContent' :{
                         templateUrl: "templates/myaccount.html",
                         controller: "MyAccountCtrl"
                     }
                 }
             })

             .state('app.myaccount-detail', {
                   url: "/myaccount/:mId",
                   views: {
                            'menuContent' :{
                             templateUrl: "templates/product-detail.html",
                             controller: "MyAccountDetailCtrl"
                            }
                        }
             })
    })

    // Services
    .factory('Products', function ($http, $rootScope) {
        return {
            getAllProducts: function() {
                return $http.get($rootScope.server.url + '/products');
            },
            get: function(productId) {
                return $http.get($rootScope.server.url + '/products/' + productId);
            }
        };
    })

    //Controllers
    .controller('MyAccountCtrl', function ($scope, $rootScope, $ionicPopup, $ionicModal, Products, User) {
            //alert('my account controller called');
            Products.getAllProducts().success(function(products) {
                $scope.products = products;
                console.log('products string'+JSON.stringify($scope.offers));
            });


            $scope.doRefresh = function() {
                Products.getAllProducts.success(function(products) {
                    $scope.products = products;
                    $scope.$broadcast('scroll.refreshComplete');
                });
            };
    })

    .controller('MyAccountDetailCtrl', function ($scope, $rootScope, $ionicPopup,$stateParams,$ionicModal, Products, User) {
                //alert('my account detail controller called');
                Products.get($stateParams.mId).success(function(products) {
                    $scope.product = products;
                    console.log('product detail string'+JSON.stringify($scope.product));
                });
    });

