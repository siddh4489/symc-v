angular.module('nibs.product', ['openfb', 'nibs.status', 'nibs.activity', 'nibs.wishlist'])

    .config(function ($stateProvider) {

        $stateProvider

//            .state('app.products', {
//                url: "/products",
//                views: {
//                    'menuContent' :{
//                        templateUrl: "templates/product-list.html",
//                        controller: "ProductListCtrl"
//                    }
//                }
//            })

            .state('app.mails', {
                url: "/mails",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/product-list.html",
                        controller: "ProductListCtrl"
                    }
                }
            })

            .state('app.mail-detail', {
                url: "/mails/:cId",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/mail-detail.html",
                        controller: "ProductDetailCtrl"
                    }
                }
            })

    })

    // REST resource for access to Products data
    .factory('Product', function ($http, $rootScope) {
        return {
            all: function() {
                return $http.get($rootScope.server.url + '/products');
            },
            get: function(productId) {
                return $http.get($rootScope.server.url + '/products/' + productId);
            },
            getAllAttachmentsForMail:function(sfid){
                return $http.get($rootScope.server.url+'/getAllAttachmentsForMail/'+sfid);
            },
            getAttachmentDetail:function(cId){
                 return $http.get($rootScope.server.url+'/getAttachmentDetail/'+cId);
            },
            deletemail:function(cId){
                return $http.delete($rootScope.server.url + '/getAttachmentDetail/' + cId);
            },
            getAttachmentById: function(cId) {
                return $http.get($rootScope.server.url + '/getAttachmentById/' + cId);
            },
            createTask: function(task){
                return $http.post($rootScope.server.url + '/tasks', task);
            }

        };
    })

    .controller('ProductListCtrl', function ($scope, Product, OpenFB,$rootScope,User,$window) {
        var user = JSON.parse($window.localStorage.getItem('user'));
        console.log('window storage user in product.js'+JSON.stringify($window.localStorage.getItem('user')));
        Product.getAllAttachmentsForMail(user.sfid).success(function(couriers){
                $scope.couriers=couriers;
                //alert('getAllCourier called'+$scope.couriers.name);
                console.log('getAllCourier called'+JSON.stringify(couriers));
        });
        $scope.doRefresh = function() {
            Product.getAllAttachmentsForMail().success(function(couriers){
                    $scope.couriers=couriers;
                    $scope.$broadcast('scroll.refreshComplete');
            });
        }
    })

    .controller('ProductDetailCtrl', function ($scope, $rootScope,$state, $stateParams, $ionicPopup,$window,Product,User) {
                $scope.attachment={};
                var attachmentId="";
                $scope.task={};
                var user = JSON.parse($window.localStorage.getItem('user'));

                $scope.deleteattachment= function() {
                      Product.deletemail(attachmentId)
                             .success(function(data){
                                  $ionicPopup.alert({title: 'Alert', content: 'Attachment deleted successfully'});
                                  $state.go('app.mails');
                             }).error(function(err){
                                  $ionicPopup.alert({title: 'Oops', content: err});
                      });
                };

                $scope.forward = function() {
                      $scope.task.subject='Forward';
                      $scope.task.description='Forward';
                      $scope.task.user=user;

                      Product.createTask($scope.task)
                             .success(function(data){
                                      $ionicPopup.alert({title: 'Alert', content: 'Task created successfully'});
                                      $state.go('app.mails');
                             }).error(function(err){
                                      $ionicPopup.alert({title: 'Oops', content: err});
                      });
                };

                $scope.openscan = function() {
                     $scope.task.subject='Open/Scan';
                     $scope.task.description='Open/Scan';
                     $scope.task.user=user;

                     Product.createTask($scope.task)
                            .success(function(data){
                                    $ionicPopup.alert({title: 'Alert', content: 'Task created successfully'});
                                    $state.go('app.mails');
                            }).error(function(err){
                                    $ionicPopup.alert({title: 'Oops', content: err});
                     });
                };


                Product.getAttachmentDetail($stateParams.cId).success(function(attachment){
                    $scope.attachment=attachment;
                });


                Product.getAttachmentById($stateParams.cId).success(function(courier) {
                      attachmentId=$stateParams.cId;
                      if(($scope.attachment.contenttype=='image/png') || ($scope.attachment.contenttype=='image/jpeg')){
                            var element = document.getElementById("displayImage");
                            var data="data:"+$scope.attachment.contenttype+";base64,"+courier;
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


    });
