angular.module('nibs.offer', ['openfb', 'nibs.status', 'nibs.activity', 'nibs.wallet'])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            // .state('app.offers', {
            //     url: "/offers",
            //     views: {
            //         'menuContent' :{
            //             templateUrl: "templates/offer-list.html",
            //             controller: "OfferListCtrl"
            //         }
            //     }
            // })
            
            .state('app.courier', {
                url: "/couriers",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/offer-list.html",
                        controller: "OfferListCtrl"
                    }
                }
            })
            
            .state('app.courier-detail', {
                url: "/couriers/:cId",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/offer-detail.html",
                        controller: "OfferDetailCtrl"
                    }
                }
            })

            .state('app.offer-redeem', {
                url: "/offers/:offerId/redeem",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/redeem.html",
                        controller: "OfferDetailCtrl"
                    }
                }
            })

    })

    // Services
    .factory('Offer', function ($http, $rootScope) {
        return {
            all: function() {
                return $http.get($rootScope.server.url + '/offers');
            },
            get: function(cId) {
                return $http.get($rootScope.server.url + '/getAttachmentById/' + cId);
            },
            getAttachmentDetail:function(cId){
                return $http.get($rootScope.server.url+'/getAttachmentDetail/'+cId);
            },
            getAllCouriers:function(sfid){
                return $http.get($rootScope.server.url+'/getAllAttachmentsForCourier/'+sfid);
            },
            couriersignature: function(mailgappform) {
                return $http.post($rootScope.server.url + '/couriersignature',mailgappform);
            },

        };
    })

    //Controllers
    .controller('OfferListCtrl', function ($scope, $rootScope, $ionicPopup, $ionicModal, Offer, User,$window) {
        var user = JSON.parse($window.localStorage.getItem('user'));

        console.log('window storage user in offer.js'+JSON.stringify($window.localStorage.getItem('user')));
        Offer.getAllCouriers(user.sfid).success(function(couriers) {
            $scope.couriers = couriers;
            console.log('couriers are'+JSON.stringify(couriers));
        });
        
        
        $scope.doRefresh = function() {
            Offer.all().success(function(couriers) {
                $scope.couriers = couriers;
                $scope.$broadcast('scroll.refreshComplete');
            });
        };
    })

    .controller('OfferDetailCtrl', function ($rootScope,$window, $scope, $state, $ionicPopup, $stateParams, Offer) {
        $scope.attachment={};

        Offer.getAttachmentDetail($stateParams.cId).success(function(attachment){
            $scope.attachment=attachment;
            console.log('attachment details '+$scope.attachment.name)
        });

       function getCourier(){

        Offer.get($stateParams.cId).success(function(courier) {
            //$scope.courier = courier;
           // window.open("data:application/pdf;base64," + courier, "_system","location=no");
           // window.open("http://www.google.com", "_system","location=no");
           //   $window.open(courier, "_blank");
            //var data =btoa(courier.body);
            //console.log('Sid -->  '+courier.body);
            //var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(courier.body)));

              if(($scope.attachment.contenttype=='image/png') || ($scope.attachment.contenttype=='image/jpeg')){
                //alert('JPEG or PNG Image');
                var element = document.getElementById("displayImage");
                    var data="data:"+$scope.attachment.contenttype+";base64,"+courier;
                    console.log('data for png/jpeg'+data);

                    element.setAttribute("src", data);
                    element.style.display = "block";
              }else{

                   //May have a mime-type definition or not
                   var myBase64 = "data:application/pdf;base64,"+courier//a red dot
                   //var myBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="//a red dot

                   //Illustrates how to use plugin with no optional parameters. Just the base64 Image.
                   window.plugins.base64ToPNG.saveImage(myBase64, {filename:$scope.attachment.name,overwrite:true},
                         function(result) {
                                 //alert('File Downloaded');
                                 $ionicPopup.alert({title: 'Success', content: "File Downloaded"});
                                 window.open('/storage/emulated/0/Pictures/'+$scope.attachment.name, '_system', 'location=yes')
                         }, function(error) {
                                 alert('Error while downloading: '+error);
                         });
              }
        });
       }

        //code for capturing the signaturing for the courier starts
               var user = JSON.parse($window.localStorage.getItem('user'));
               $scope.showImageFlag=false;
               $scope.courierSign={};
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

               $scope.courierformclick = function() {
                     if (signaturePad.isEmpty()) {
                            $ionicPopup.alert({title: 'Oops', content: 'Please provide signature.'});
                     }else {
                          var dataURL = signaturePad.toDataURL();
                              dataURL = dataURL.replace('data:image/png;base64,', '');
                              $scope.courierSign.signatureDataurl = dataURL;
                              $scope.courierSign.userId = user.sfid;
                              $scope.courierSign.attachmentId = $scope.attachment.sfid;
                              console.log('Courier Sign is'+$scope.courierSign.attachmentId+" "+$scope.courierSign.userId);
                          Offer.couriersignature($scope.courierSign)
                                 .success(function (data) {
                                      $ionicPopup.alert({title: 'Alert', content: "Signature submitted successfully."});
                                      $scope.showImageFlag=true;
                                      getCourier();
                                 }).error(function (err) {
                                      $ionicPopup.alert({title: 'Oops', content: 'There is some error'+err});
                          });
                     }
               },

               $scope.clearSign=function(){
                      signaturePad.clear();
               }


        //code for capturing the signaturing for the courier ends




//        $scope.shareOnFacebook = function (offer) {
////      Uncomment to enable actual "Share on Facebook" feature
////            OpenFB.post('/me/feed', {name: offer.name, link: offer.campaignPage, picture: offer.image, caption: 'Offer ends soon!', description: offer.description})
////                .success(function() {
////                    Status.show('Shared on Facebook!');
////                    var activity = new Activity({type: "Shared on Facebook", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image});
////                    activity.$save(Status.checkStatus);
////                })
////                .error(function() {
////                    $ionicPopup.alert({title: 'Facebook', content: 'Something went wrong while sharing this offer.'});
////                });
//            Status.show('Shared on Facebook!');
//            Activity.create({type: "Shared on Facebook", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image})
//                .success(function(status) {
//                    Status.checkStatus(status);
//                });
//
//        };
//
//        $scope.shareOnTwitter = function () {
//            Status.show('Shared on Twitter!');
//            Activity.create({type: "Shared on Twitter", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image})
//                .success(function(status) {
//                    Status.checkStatus(status);
//                });
//        };
//
//        $scope.shareOnGoogle = function () {
//            Status.show('Shared on Google+!');
//            Activity.create({type: "Shared on Google+", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image})
//                .success(function(status) {
//                    Status.checkStatus(status);
//                });
//        };
//
//        $scope.saveToWallet = function () {
//            WalletItem.create({offerId: $scope.offer.id}).success(function(status) {
//                Status.show('Saved to your wallet!');
//                Activity.create({type: "Saved to Wallet", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image})
//                    .success(function(status) {
//                        Status.checkStatus(status);
//                    });
//            });
//        };
//
//        $scope.redeem = function () {
//            Activity.create({type: "Redeemed Offer", points: 1000, offerId: $scope.offer.sfid, name: $scope.offer.name, image: $scope.offer.image})
//                .success(function(status) {
//                    Status.checkStatus(status);
//                });
//            $state.go('app.offer-redeem', {offerId: $scope.offer.id});
//        };

    });
