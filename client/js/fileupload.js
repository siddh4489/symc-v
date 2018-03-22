angular.module('nibs.fileupload', ['naif.base64'])

    // Routes
    .config(function ($stateProvider) {
        $stateProvider
             .state('app.fileupload', {
                 url: "/fileupload",
                 views: {
                     'menuContent' :{
                         templateUrl: "templates/fileupload.html",
                         controller: "FileUploadCtrl"
                     }
                 }
             })
    })

    // Services
    .factory('FileUpload', function ($http, $rootScope) {
        return {
            fileupload: function(file) {
                return $http.post($rootScope.server.url + '/fileupload/', file);
            }
        };
    })


    .controller('FileUploadCtrl', function ($scope,$rootScope,$state,User,$window,FileUpload,$ionicPopup) {
                $scope.myfile={};
                var user = JSON.parse($window.localStorage.getItem('user'));
              //$scope.myfile.sfid=$rootScope.user.sfid;
             // $scope.myfile.email=$rootScope.user.email;
                $scope.myfile.sfid='003j000000bPBpHAAW';
                $scope.onLoad = function (e, reader, file, fileList, fileOjects, fileObj) {
                       $scope.myfile.filename=file.name;
                       $scope.myfile.filetype=file.type;
                       $scope.myfile.filesize=file.size;
                       alert(file.name+" "+file.type+" "+file.size);
                 	   var fileReader = new FileReader();
                           fileReader.onload = function(fileLoadedEvent){
                                var baseURL="";
                                if($scope.myfile.filetype==='image/jpeg' || $scope.myfile.filetype==='image/png'){
//                                	console.log('image file');
                                    baseURL=fileLoadedEvent.target.result.replace(/^data:image\/(png|jpeg);base64,/, "");
                                }else{
//  									console.log('pdf file');
                                    baseURL=fileLoadedEvent.target.result.replace(/^data:application\/pdf;base64,/, "");
                                }
                                $scope.myfile.base64URL=baseURL;
                           };
                           fileReader.readAsDataURL(file);
                };


             $scope.upload=function(){
           	  	  console.log("file data is"+JSON.stringify($scope.myfile));
           	  	  if($scope.myfile.filename=='undefined' || $scope.myfile.filename==''){
                       $ionicPopup.alert({title: 'Alert', content: 'Please select one file.'});
           	  	  }else if(($scope.myfile.filesize/1024) > 5120){
           	  	       $ionicPopup.alert({title: 'Alert', content: 'File size exceeds more then 5MB.'});
           	  	  }else{
           	  	    alert('file upload else');
                    FileUpload.fileupload($scope.myfile).success(function() {
                              $ionicPopup.alert({title: 'Alert', content: 'File Uploaded successfully.'});
                              $state.go("app.fileupload");
                    }).error(function (err) {
                              $ionicPopup.alert({title: 'Oops', content: err});
                    });
                  }
             }
        });

//    .controller('FileUploadCtrl', function ($scope, $rootScope, $ionicPopup,$window,User,FileUpload) {
//                $scope.files = [];
//                var user = JSON.parse($window.localStorage.getItem('user'));
//                var uploadedCount = 0;
//                alert('sfid'+$rootScope.user.sfid);
//                $scope.file = {};
//                $scope.file.sfid=$rootScope.user.sfid;
//
//                $scope.upload = function() {
//                       var files = angular.copy($scope.files);
//                       if ($scope.file) {
//                          files.push($scope.file);
//                       }
//                  for (var i = files.length - 1; i >= 0; i--) {
//                      var  filedata = files[i];
//                      alert(JSON.stringify(filedata));
//
//                  }
//                };
//                //$scope.upload = function() {
//                //       alert('upload function called'+filedata.name);
////                       if (files.length === 0) {
////                           alert('Please select files!');
////                           return false;
////                       }else{
////                           alert('else file');
//                          /* FileUpload.fileupload($scope.file).success(function() {
//                                  $ionicPopup.alert({title: 'Alert', content: 'File Uploaded successfully.'});
//                           });
//                          */
////                       }
//                //};
//    });
