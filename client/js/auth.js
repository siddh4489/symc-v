angular.module('nibs.auth', ['openfb', 'nibs.config'])

    /*
     * Routes
     */
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.login', {
                url: "/login",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/login.html",
                        controller: "LoginCtrl"
                    }
                }
            })

            .state('app.logout', {
                url: "/logout",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/logout.html",
                        controller: "LogoutCtrl"
                    }
                }
            })

            .state('app.signup', {
                url: "/signup",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/signup.html",
                        controller: "SignupCtrl"
                    }
                }
            })

            .state('app.forgotpassword', {
                  url : "/forgot",
                  views : {
                        'menuContent':{
                            templateUrl:"templates/forgotpassword.html",
                            controller:"ForgotPasswordCtrl"
                        }
                  }
            })

    })

    /*
     * REST Resources
     */
    .factory('Auth', function ($http, $window, $rootScope) {

        return {
            login: function (user) {
                return $http.post($rootScope.server.url + '/login', user)
                    .success(function (data) {
                        $rootScope.user = data.user;

                        $window.localStorage.user = JSON.stringify(data.user);
                        $window.localStorage.token = data.token;
                        console.log('user data is'+JSON.stringify(data.user));
                        console.log('Subscribing for Push as ' + data.user.email);
                        if (typeof(ETPush) != "undefined") {
                            ETPush.setSubscriberKey(
                                function() {
                                    console.log('setSubscriberKey: success');
                                },
                                function(error) {
                                    alert('Error setting Push Notification subscriber');
                                },
                                data.user.email
                            );
                        }

                    });
            },
            fblogin: function (fbUser) {
                console.log(JSON.stringify(fbUser));
                return $http.post($rootScope.server.url + '/fblogin', {user:fbUser, token: $window.localStorage['fbtoken']})
                    .success(function (data) {
                        $rootScope.user = data.user;
                        $window.localStorage.user = JSON.stringify(data.user);
                        $window.localStorage.token = data.token;

                        console.log('Subscribing for Push as ' + data.user.email);
                        if (typeof(ETPush) != "undefined") {
                            ETPush.setSubscriberKey(
                                function() {
                                    console.log('setSubscriberKey: success');
                                },
                                function(error) {
                                    alert('Error setting Push Notification subscriber');
                                },
                                data.user.email
                            );
                        }

                    });
            },
            logout: function () {
                $rootScope.user = undefined;
                var promise = $http.post($rootScope.server.url + '/logout');
                $window.localStorage.removeItem('user');
                $window.localStorage.removeItem('token');
                return promise;
            },
            signup: function (user) {
                return $http.post($rootScope.server.url + '/signup', user);
            },
            forgotpassword:function(useremail){
                return $http.post($rootScope.server.url+'/forgot',useremail);
            },
            verify:function(verifycode){
                return $http.post($rootScope.server.url+'/verify',verifycode);
            },
            updatepassword:function(password){
                return $http.post($rootScope.server.url+'/updatepassword',password);
            },
            updateVerificatonCodeStatus:function(data){
                return $http.post($rootScope.server.url+'/updateVerificatonCodeStatus',data);
            }
        }
    })

    /*
     * Controllers
     */

    .controller('ForgotPasswordCtrl',function($scope, $rootScope, $state, $window,$ionicPopup, $ionicModal,Auth){
        $scope.forgot = {};
        $scope.flag=true;
        $scope.showPassword=false;
        $scope.verifyflag=false;

        $scope.submit = function(){

            function ValidateEmail(mail){
                 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
                    return (true);
                  }

                return (false);
            }

        if($scope.forgot.email =='undefined' || $scope.forgot.email ==''){
            $ionicPopup.alert({title: 'Alert', content: 'Please provide Email value'});
        }else if(!ValidateEmail($scope.forgot.email)){
            $ionicPopup.alert({title: 'Alert', content: 'You have entered an invalid email address!'});
        }else{
             var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for( var i=0; i < 5; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                $scope.forgot.code=text;
                //alert('data is'+JSON.stringify($scope.forgot));
                Auth.forgotpassword($scope.forgot)
                    .success(function (data) {
                        $ionicPopup.alert({title: 'Alert', content: 'Email has been sent to provided EmailID'});
                        $scope.flag=false;
                        $scope.showPassword=false;
                        $scope.verifyflag=true;

                        var SendEmailPlugin =
                            {
                             createEvent: function() {
                                cordova.exec(
                                         null,
                                         null,
                                        'SendEmailPlugin', // mapped to our native Java class called "CalendarPlugin"
                                        'sendEmail', // with this action name
                                       [{                  // and this array of custom arguments to create our entry
                                          "Email": $scope.forgot.email,
                                          "Code":text
                                       }]
                                );
                             }
                            }
                            SendEmailPlugin.createEvent();
                    }).error(function (err) {
                        $ionicPopup.alert({title: 'Oops', content: err});
                    });
        }
        };

        $scope.verify = function(){

                 if($scope.forgot.code =='undefined' || $scope.forgot.code ==''){
                     $ionicPopup.alert({title: 'Alert', content: 'Please provide Verificaition Code value'});
                 }else{
                         //alert('data is'+JSON.stringify($scope.forgot));
                         Auth.verify($scope.forgot)
                             .success(function (data) {
                                //alert('status data is'+JSON.stringify(data));
                                if(data.status ==='match'){
                                    $scope.flag=false;
                                    $scope.showPassword=true;
                                    $scope.verifyflag=false;
                                }else{
                                    $ionicPopup.alert({title: 'Alert', content: 'Mismatch in Verification Code.'});
                                }

                             }).error(function (err) {
                                 $ionicPopup.alert({title: 'Oops', content: err});
                             });
                 }
        };

        $scope.updatepassword = function() {

                 if($scope.forgot.code =='undefined' || $scope.forgot.code ==''){
                         $ionicPopup.alert({title: 'Alert', content: 'Please provide Verificaition Code value'});
                 }else{
                    //alert('data is'+JSON.stringify($scope.forgot));
                    Auth.updatepassword($scope.forgot)
                        .success(function (data) {
                               $ionicPopup.alert({title: 'Alert', content: 'Password Updates Successfully.'});
                                                    Auth.updateVerificatonCodeStatus($scope.forgot)
                                                        .success(function (data) {
                                                            //$ionicPopup.alert({title: 'Alert', content: 'Password Updates Successfully.'});
                                                            console.log('verification code status updated');
                                                            $state.go('app.welcome');
                                                        }).error(function (err) {
                                                            //$ionicPopup.alert({title: 'Oops', content: err
                                                            console.log('verification code status not updated');
                                                    });

                               flag=true;
                        }).error(function (err) {
                               $ionicPopup.alert({title: 'Oops', content: err});
                    });
                 }
        }
    })


    .controller('LoginCtrl', function ($scope, $rootScope, $state, $window, $location, $ionicViewService, $ionicPopup, $ionicModal, Auth, OpenFB) {

        $ionicModal.fromTemplateUrl('templates/server-url-setting.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.openAppDialog = function() {
            $scope.modal.show();
        };

        $scope.$on('modal.hidden', function(event) {
            $window.localStorage.setItem('serverURL', $rootScope.server.url);
        });

        $window.localStorage.removeItem('user');
        $window.localStorage.removeItem('token');

        $scope.user = {};

        $scope.login = function () {

            Auth.login($scope.user)
                .success(function (data) {

                    if(data.user.isformfilled==false){
                        $state.go("app.mailgapform");
                    }else if(data.user.isformfilled==true){
                        $state.go("app.mailgapformdetail");
                    }else{
                        $state.go("app.profile");
                    }


                })
                .error(function (err) {
                    $ionicPopup.alert({title: 'Oops', content: err});
                });
        };

        $scope.forgotpassword = function(){
            $state.go("app.forgotpassword");
        };

        $scope.facebookLogin = function () {

            OpenFB.login('email, publish_actions').then(
                function () {
                    OpenFB.get('/me', {fields: 'id,first_name,last_name,email,picture,birthday,gender'})
                        .success(function (fbUser) {
                            Auth.fblogin(fbUser)
                                .success(function (data) {

                                    $state.go("app.profile");
                                    setTimeout(function () {
                                        $ionicViewService.clearHistory();
                                    });
                                })
                                .error(function (err) {

                                    console.log('FB error'+JSON.stringify(err));
                                    $ionicPopup.alert({title: 'Oops', content: err});
                                })
                        })
                        .error(function () {
                            $ionicPopup.alert({title: 'Oops', content: "The Facebook login failed"});
                        });
                },
                function () {
                    $ionicPopup.alert({title: 'Oops', content: "The Facebook login failed"});
                });
        };

    })

    .controller('LogoutCtrl', function ($rootScope, $window,$ionicPopup,$state) {
        console.log("Logout");
        var confirmPopup = $ionicPopup.confirm({
              title: 'Logout',
              template: 'Are you sure want to Logout ?',
           });

           confirmPopup.then(function(res) {
              if (res) {
                 $rootScope.user = null;
                 $window.localStorage.removeItem('user');
                 $window.localStorage.removeItem('token');
                 $state.go('app.welcome');
              } else {
                 $state.go('app.profile');
              }
           });
    })


    .controller('SignupCtrl', function ($scope, $state, $ionicPopup, Auth, OpenFB) {

        $scope.user = {};

        $scope.signup = function () {
            if ($scope.user.password !== $scope.user.password2) {
                $ionicPopup.alert({title: 'Oops', content: "passwords don't match"});
                return;
            }
            Auth.signup($scope.user)
                .success(function (data) {
                    $ionicPopup.alert({title: 'Alert', content: "Signed Up successfully."});
                    $state.go("app.login");
                }).error(function(err){
                    $ionicPopup.alert({title: 'Oops', content: err});
                });
        };

        $scope.facebookLogin = function () {

            OpenFB.login('email, publish_actions').then(
                function () {
                    OpenFB.get('/me', {fields: 'id,first_name,last_name,email,picture,birthday,gender'})
                        .success(function (fbUser) {
                            Auth.fblogin(fbUser)
                                .success(function (data) {
                                    $state.go("app.profile");
                                    setTimeout(function () {
                                        $ionicViewService.clearHistory();
                                    });
                                })
                                .error(function (err) {
                                    $ionicPopup.alert({title: 'Oops', content: err});
                                })
                        })
                        .error(function () {
                            $ionicPopup.alert({title: 'Oops', content: "The Facebook login failed"});
                        });
                },
                function () {
                    $ionicPopup.alert({title: 'Oops', content: "The Facebook login failed"});
                });
        };

    });
