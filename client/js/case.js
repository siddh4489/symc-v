angular.module('nibs.case', ['nibs.config'])

    // Routes
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.help', {
                url: "/help",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/case.html",
                        controller: "CaseCtrl"
                    }
                }
            })
    })

    // Services
    .factory('Case', function ($http, $rootScope) {
        return {
            create: function(theCase) {
                return $http.post($rootScope.server.url + '/cases/', theCase);
            }
        };
    })

    //Controllers
    .controller('CaseCtrl', function ($scope, $window, $ionicPopup, Case, User) {
        
        $scope.case = {};

        $scope.submit = function () {
            if($scope.case.subject=='undefined' || $scope.case.description=='undefined' || $scope.case.subject=='' || $scope.case.description==''){
                $ionicPopup.alert({title: 'Alert', content: 'Please enter the Subject/Description.'});
            }else{
                Case.create($scope.case).success(function() {
                     $ionicPopup.alert({title: 'Thank You', content: 'A customer representative will contact you shortly.'});
                     $scope.case = {};
                });
            }
        };


    });
