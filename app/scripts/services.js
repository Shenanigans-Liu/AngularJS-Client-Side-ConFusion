'use strict';

angular.module('confusionApp')
        //.constant("baseURL","https://confusionserver.shen-confusion.com/")
        .constant("baseURL","http://localhost:3000/")
.factory('menuFactory', ['$resource','baseURL',function($resource,baseURL) {
            return $resource(baseURL + "dishes/:id", null, {
                'update': {
                    method: 'PUT'
                }
            });
              
        }])

.factory('commentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
            return $resource(baseURL + "dishes/:id/comments/:commentId", {id:"@Id", commentId: "@CommentId"}, {
                'update': {
                    method: 'PUT'
                }
            });

        }])

.factory('promotionFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
            return $resource(baseURL + "promotions/:id", null, {
                    'update': {
                        method: 'PUT'
                    }
                });

        }])

.factory('corporateFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
            return $resource(baseURL + "leadership/:id", null, {
                    'update': {
                        method: 'PUT'
                    }
            });

        }])

.factory('feedbackFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
            return $resource(baseURL + "feedback/:id", null, {
                'update': {
                    method: 'PUT'
                }
            });
}])
 
.factory('$localStorage', ['$window', function ($window) {
        return {
            store: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            remove: function (key) {
                $window.localStorage.removeItem(key);
            },
            storeObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key, defaultValue) {
                return JSON.parse($window.localStorage[key] || defaultValue);
            }
        }
    }])
        
.factory('AuthFactory', ['$state', '$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL', 'ngDialog', function($state, $resource, $http, $localStorage, $rootScope, $window, baseURL, ngDialog){
    
            var authFac = {};
            var TOKEN_KEY = 'Token';
            var isAuthenticated = false;
            var username = '';
            var authToken = undefined;
            var showError = false;

            // load current logged in user credentials
            function loadUserCredentials() {
                var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
                if (credentials.username != undefined) {
                  useCredentials(credentials);
                }
              }
            
            // store the current logged in user credentials into localstorage
            // and set the token in the header for each request
            function storeUserCredentials(credentials) {
                $localStorage.storeObject(TOKEN_KEY, credentials);
                useCredentials(credentials);
            }

            // set the token in the header for each request from user
            function useCredentials(credentials) {
                isAuthenticated = true;
                username = credentials.username;
                authToken = credentials.token;

                // Set the token as header for your requests!
                $http.defaults.headers.common['x-access-token'] = authToken;
            }

            // remove all infomation of credentials
            function destroyUserCredentials() {
                authToken = undefined;
                username = '';
                isAuthenticated = false;
                $http.defaults.headers.common['x-access-token'] = authToken;
                $localStorage.remove(TOKEN_KEY);
            }
            
            // regular login
            authFac.login = function(loginData) {
                var message = '\
                            <div class="ngdialog-message">\
                            <h4 align=center><i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i><span> Logging in...</span><h4>'
                ngDialog.open({ template: message, plain: 'true'});
                
                $resource(baseURL + "users/login")
                .save(loginData,
                    function(response) {
                        storeUserCredentials({username:loginData.username, token: response.token});
                        showError = false;
                        ngDialog.close();
                        $rootScope.$broadcast('login:Successful');
                        $state.go($state.current, {}, {reload: true});
                    },
                   function(response){
                        isAuthenticated = false;
                        showError = true;
                        ngDialog.close();
                        $rootScope.$broadcast('login:Failed');
                    }
                );
            };
    
            // facebook login
            authFac.faceLogin = function() {
                $resource(baseURL + "users/facebook").get(
                    function() {
                        console.log(response);
                    }
                );
            };
            
            
            // logout
            authFac.logout = function() {
                $resource(baseURL + "users/logout").get(function(response){
                });
                destroyUserCredentials();
                $rootScope.$broadcast('logout:Successful');
                $state.go($state.current, {}, {reload: true});
            };

            authFac.register = function(registerData) {
                var message = '\
                            <div class="ngdialog-message">\
                            <h4 align=center><i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i><span> Registering...</span><h4>'
                ngDialog.open({ template: message, plain: 'true'});
                $resource(baseURL + "users/register")
                .save(registerData,
                    function(response) {
                        ngDialog.close();
                        authFac.login({username:registerData.username, password:registerData.password});
                    if (registerData.rememberMe) {
                        $localStorage.storeObject('userinfo',
                        {username:registerData.username, password:registerData.password});
                    }
                    $rootScope.$broadcast('registration:Successful');
                   },
                   function(response){
                      var message = '\
                        <div class="ngdialog-message">\
                        <div><h4>Registration Unsuccessful</h4></div>' +
                          '<div><p>' +  response.data.err.message + 
                          '</p><p>' + response.data.err.name + '</p></div>';

                        ngDialog.openConfirm({ template: message, plain: 'true'});
                   }

                );
            };

            authFac.isAuthenticated = function() {
                return isAuthenticated;
            };

            authFac.getUsername = function() {
                return username;  
            };
    
            authFac.showErrorMessage = function() {
                return showError;
            }

            loadUserCredentials();

            return authFac;

        }])

.factory('favoriteFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

    return $resource(baseURL + "favorites/:id", null, {
            'update': {
                method: 'PUT'
            },
            //'query':  {method:'GET', isArray:false}
    });

}])

.factory('usercommentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

    return $resource(baseURL + "comments", null, {
            'update': {
                method: 'PUT'
            }
    });

}])
