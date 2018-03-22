angular.module('nibs.mailgapform', ['openfb', 'nibs.status', 'nibs.activity', 'nibs.wishlist'])

    .config(function ($stateProvider) {

        $stateProvider

            .state('app.mailgapform', {
                url: "/mailgapform",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/mailgapform.html",
                        controller: "MailGapCtrl"
                    }
                }
            })
            
            .state('app.mailgapformdetail',{
            	url:'/mailgapformdetail',
            	views:{
            		'menuContent':{
            			templateUrl:"templates/mailgapformdetail.html",
            			controller:"MailGapDetailCtrl"
            		}
            			
            	}
            })
            
            .state('app.rsagreement',{
            	url:'/rsagreement',
            	views:{
            		'menuContent':{
            			templateUrl:"templates/rsagreement.html",
            			controller:"RSAgreementDetailCtrl"
            		}
            			
            	}
            })

    })

    // REST resource for access to Products data
    
    .factory('Mailgap', function ($http, $rootScope) {
        return {
            mailgapsubmit: function(mailgappform) {
                return $http.post($rootScope.server.url + '/mailgapp',mailgappform);
            },
            get:function(){
            	return $http.post($rootScope.server.url + '/mailgappformdetail',$rootScope.user);
            	
            },
            rsagreement:function(){
                return $http.post($rootScope.server.url + '/rsagreement',$rootScope.user);
            }

        };
    })
    
    
    
    .controller('MailGapDetailCtrl',function($scope,$state,$ionicPopup,Mailgap,User,$rootScope){
    	Mailgap.get().success(function(mailgapformdata) {

            $scope.mailgap = mailgapformdata[0];
          var data="data:image/png;base64,"+$scope.mailgap.mg_applicant_signature__c;
            $scope.mailgap.imagesrc=data;

        });
        	
        $scope.download=function(){
    		
    	var doc = new jsPDF();
        doc.fromHTML($('.form').html(), 15, 15, {
            'width': 170
        });
        doc.save('mailgapp.pdf');
    		    
    	}
    })
    
    .controller('RSAgreementDetailCtrl',function($scope,$state,$ionicPopup,Mailgap,User,$rootScope){
    	Mailgap.rsagreement().success(function(mailgapformdata) {

            $scope.mailgap = mailgapformdata[0];
          console.log('rs agreement data'+mailgapformdata[0])

    });
        	
        $scope.download=function(){
    		
    	var doc = new jsPDF();
        doc.fromHTML($('.form').html(), 15, 15, {
            'width': 170
        });
        doc.save('mailgapp.pdf');
    		    
    	}
    })

    .controller('MailGapCtrl', function ($scope,$state,$window,$ionicPopup,Mailgap,$rootScope) {
          $scope.mailgapform = {};
          $scope.mailgapform.user = $rootScope.user.email;
          $scope.mailgapform.deliveryaddress = '1888 Kalakaua Ave C312';
          $scope.mailgapform.deliverycity = 'Honolulu';
          $scope.mailgapform.deliverystate = 'HI';
          $scope.mailgapform.deliveryzipcode = '96815-1550';
          $scope.mailgapform.authorizedname = 'Resource Suites LLC';
          $scope.mailgapform.authorizedaddress = '1888 Kalakaua Ave C312';
          $scope.mailgapform.authorizedcity = 'Honolulu';
          $scope.mailgapform.authorizedstate = 'HI';
          $scope.mailgapform.authorizedzipcode = '96815-1550';
          $scope.mailgapform.danielsign = 'data:image/png;base64,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';
        // Mailgap.get($rootScope.user).success(function(mailgapformdata) {
        //       $scope.mailgapform = mailgapformdata;
        //       console.log('the mailgapp data is'+$scope.mailgapform);
        //   });
        var wrapper = document.getElementById("signature-pad"),
        canvas = wrapper.querySelector("canvas"),
        signaturePad;
        function resizeCanvas() {
              var ratio = window.devicePixelRatio || 1;
              canvas.width = canvas.offsetWidth * ratio;
              canvas.height = canvas.offsetHeight * ratio;
              canvas.getContext("2d").scale(ratio, ratio);
        }

        window.onresize = resizeCanvas;
        resizeCanvas();
        signaturePad = new SignaturePad(canvas);

        $scope.mailgapformclick = function() {
            if (signaturePad.isEmpty()) {
                  $ionicPopup.alert({title: 'Oops', content: 'Please provide signature.'});
            }else {
                  var dataURL = signaturePad.toDataURL();
                  dataURL = dataURL.replace('data:image/png;base64,', '');
                  $scope.mailgapform.signatureDataurl = dataURL;

                  Mailgap.mailgapsubmit($scope.mailgapform)
                         .success(function (data) {
                            $ionicPopup.alert({title: 'Success', content: "The Mailgapp form submitted"});
                                  $state.go("app.mailgapformdetail");
                         })
                         .error(function () {
                            $ionicPopup.alert({title: 'Oops', content: 'There is some error'});
                         });

            }
        },

        $scope.clearSign=function(){
            signaturePad.clear();
        }

         $scope.sos = function() {
           var user = JSON.parse($window.localStorage.getItem('user'));
                          console.log('the user email is'+user.email);
                          var SOSPlugin =
                                        {
                                          createEvent: function(Email) {
                                            cordova.exec(
                                                null,
                                                null,
                                                'SOSPlugin', // mapped to our native Java class called "CalendarPlugin"
                                                'callNativeMethod', // with this action name
                                                [{                  // and this array of custom arguments to create our entry
                                                    "Email": user.email,
                                                }]
                                            );
                                          }
                                        }
                    var user = JSON.parse($window.localStorage.getItem('user'));
                    //$window.location = 'sos://' + user.email;
                    SOSPlugin.createEvent(user.email);
         };

    });

//    .controller('ProductDetailCtrl', function ($scope, $rootScope, $stateParams, $ionicPopup, Product, OpenFB, WishListItem, Activity, Status) {
//
//        Product.get($stateParams.productId).success(function(product) {
//            $scope.product = product;
//        });
//
//        $scope.shareOnFacebook = function () {
//            Status.show('Shared on Facebook!');
//            Activity.create({type: "Shared on Facebook", points: 1000, productId: $scope.product.sfid, name: $scope.product.name, image: $scope.product.image})
//                .success(function(status) {
//                    Status.checkStatus(status);
//                });
//        };
//
//        $scope.shareOnTwitter = function () {
//            Status.show('Shared on Twitter!');
//            Activity.create({type: "Shared on Twitter", points: 1000, productId: $scope.product.sfid, name: $scope.product.name, image: $scope.product.image})
//                .success(function(status) {
//                    Status.checkStatus(status);
//                });
//        };
//
//        $scope.shareOnGoogle = function () {
//            Status.show('Shared on Google+!');
//            Activity.create({type: "Shared on Google+", points: 1000, productId: $scope.product.sfid, name: $scope.product.name, image: $scope.product.image})
//                .success(function(status) {
//                    Status.checkStatus(status);
//                });
//        };
//
//        $scope.saveToWishList = function () {
//            WishListItem.create({productId: $scope.product.id}).success(function(status) {
//                Status.show('Added to your wish list!');
//                Activity.create({type: "Added to Wish List", points: 1000, productId: $scope.product.sfid, name: $scope.product.name, image: $scope.product.image})
//                    .success(function(status) {
//                        Status.checkStatus(status);
//                    });
//            });
//        };
//
//    });
