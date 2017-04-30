'use strict';
angular.module('confusionApp')

.controller('MenuController', ['$scope', 'menuFactory', 'favoriteFactory','AuthFactory', 'ngDialog', '$timeout', function($scope, menuFactory, favoriteFactory, AuthFactory, ngDialog, $timeout) {
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showDetails = false;
            $scope.showMenu = false;
            $scope.message = "Loading...";
    
            $scope.dishes= menuFactory.query(
                function(response) {
                        $scope.dishes = response;
                        $scope.showMenu = true;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );
            $scope.select = function(setTab) {
                $scope.tab = setTab;
                if (setTab === 2) {
                    $scope.filtText = "appetizer";
                }
                else if (setTab === 3) {
                    $scope.filtText = "mains";
                }
                else if (setTab === 4) {
                    $scope.filtText = "dessert";
                }
                else {
                    $scope.filtText = "";
                }
            };
            $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };
            $scope.toggleDetails = function() {
                $scope.showDetails = !$scope.showDetails;
            };
            $scope.addToFavorites = function(dishid) {
                    //$("#success-alert").hide();
                if (AuthFactory.isAuthenticated()) {
                    favoriteFactory.save({_id: dishid});
                    $("#success-alert").fadeIn();
                    $timeout(function() { 
                        $("#success-alert").fadeOut(); 
                    }, 500);
                    console.log('Add to favorites', dishid);
                } else {
                    $("#login-alert").fadeIn();
                    $timeout(function() { 
                        $("#login-alert").fadeOut(); 
                    }, 1500);
                    /*var message = '\
                        <div class="ngdialog-message">\
                        <div><h4>Log in to add your favorite dish</h4></div>'

                        ngDialog.openConfirm({ template: message, plain: 'true'});*/
                }
            };
        }])

        
.controller('ContactController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {

    $scope.feedback = {
        mychannel: "",
        firstName: "",
        lastName: "",
        agree: false,
        email: ""
    };

    var channels = [{
        value: "tel",
        label: "Tel."
    }, {
        value: "Email",
        label: "Email"
    }];

    $scope.channels = channels;
    $scope.invalidChannelSelection = false;

    $scope.sendFeedback = function () {


        if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
            $scope.invalidChannelSelection = true;
        } else {
            $scope.invalidChannelSelection = false;
            feedbackFactory.save($scope.feedback);
            $scope.feedback = {
                mychannel: "",
                firstName: "",
                lastName: "",
                agree: false,
                email: ""
            };
            $scope.feedback.mychannel = "";
            $scope.feedbackForm.$setPristine();
        }
    };
}])

.controller('DishDetailController', ['$scope', '$rootScope', '$state', '$stateParams', 'menuFactory', 'commentFactory', 'AuthFactory','ngDialog', function ($scope, $rootScope, $state, $stateParams, menuFactory, commentFactory, AuthFactory, ngDialog) {

            $scope.showDish = false;
            $scope.message = "Loading ...";
            $scope.loggedin = (AuthFactory.isAuthenticated());
            $scope.dish = menuFactory.get({
                    id: $stateParams.id
                })
                .$promise.then(
                    function (response) {
                        $scope.dish = response;
                        $scope.showDish = true;
                        for (var i = 0; i < $scope.dish.comments.length; i++) {
                            var rate = $scope.dish.comments[i].rating;
                            var stars = [];
                            for (var j = 0; j < rate; j++) {
                                stars.push(j);
                            }
                            $scope.dish.comments[i]['star'] = stars;
                        }
                    },
                    function (response) {
                        $scope.message = "Error: " + response.status + " " + response.statusText;
                    }
                );
            
    
            $scope.mycomment = {
                rating: 5,
                comment: ""
            };
            
            console.log($scope.mycomment)

            $scope.submitComment = function () {

                commentFactory.save({id: $stateParams.id}, $scope.mycomment)
                .$promise.then(
                    function(response){
                        //$scope.feedbackForm.$setPristine();
                        $scope.mycomment = {
                            rating: 5,
                            comment: ""
                        };
                        $state.go($state.current, {}, {reload: true});
                    }
                )
            }
            
            $scope.openLogin = function () {
                ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
            };
            
            $scope.loggedin = AuthFactory.isAuthenticated();
        }])

.controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory', 'promotionFactory', function($scope, menuFactory, corporateFactory, promotionFactory) {
                $scope.showDish = false;
                $scope.showLeader = false;
                $scope.showPromo = false;
                $scope.message="Loading ...";
            
                $scope.person = corporateFactory.query({
                    featured: "true"
                })
                .$promise.then(
                    function(response) {
                        var people = response;
                        $scope.person = people[0];
                        $scope.showLeader = true;
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    }
                )
                
                $scope.promotion = promotionFactory.query({
                    featured: "true"
                })
                .$promise.then(
                    function(response) {
                        var promotions = response;
                        $scope.promotion = promotions[0];
                        $scope.showPromo = true;
                        console.log($scope.promotion)
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    }
                )
                
                $scope.dish = menuFactory.query({
                    featured: "true"
                })
                .$promise.then(
                    function(response){
                        var dishes = response;
                        $scope.dish = dishes[0];
                        $scope.showDish = true;
                        console.log(response);
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    }
                );
        }])

.controller('AboutController', ['$scope', 'corporateFactory', function ($scope, corporateFactory) {
            $scope.leaders = corporateFactory.query();
        }])

.controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthFactory', '$document', function ($scope, $state, $rootScope, ngDialog, AuthFactory, $document) {

    $scope.loggedIn = false;
    $scope.username = '';
   
    $(document).on('click', function (event) {
        var clickover = $(event.target);
        var $navbar = $(".navbar-collapse");               
        var _opened = $navbar.hasClass("in");
        if (_opened === true && !clickover.hasClass("navbar-toggle")) {      
            $navbar.collapse('hide');
        }
    });
    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
    $scope.logOut = function() {
        AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    var deregister1 =
        $rootScope.$on('login:Successful', function () {
            $scope.loggedIn = AuthFactory.isAuthenticated();
            $scope.username = AuthFactory.getUsername();
        });
    var deregister2 =
        $rootScope.$on('registration:Successful', function () {
            $scope.loggedIn = AuthFactory.isAuthenticated();
            $scope.username = AuthFactory.getUsername();
        });
    var deregister3 =
        $rootScope.$on('login:Failed', function() {
            console.log("Login failed!!!")
            $scope.openLogin();
        })
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
    
    $scope.$on('$destroy', deregister1);
    $scope.$on('$destroy', deregister2);
    $scope.$on('$destroy', deregister3);
    
}])

.controller('LoginController', ['$state', '$scope', 'ngDialog', '$localStorage', 'AuthFactory', '$rootScope', function ($state, $scope, ngDialog, $localStorage, AuthFactory, $rootScope) {
    $scope.showError = AuthFactory.showErrorMessage();
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe) {
            $localStorage.storeObject('userinfo',$scope.loginData);
        }
        AuthFactory.login($scope.loginData);
    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };
    
    $scope.facebookLogin = function() {
        //AuthFactory.faceLogin();
    };
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);
        AuthFactory.register($scope.registration);
        ngDialog.close();

    };
}])

.controller('ProfileController', ['$scope', '$state', 'favoriteFactory', 'AuthFactory', 'menuFactory', 'commentFactory', 'usercommentFactory', function ($scope, $state, favoriteFactory, AuthFactory, menuFactory, commentFactory, usercommentFactory) {

    $scope.tab = 1;
    $scope.filtText = '';
    $scope.showDetails = false;
    $scope.showDelete = false;
    $scope.showMenu = false;
    $scope.message = "Loading ...";
    $scope.loggedIn = AuthFactory.isAuthenticated();
    $scope.isEmptyFav = true;
    $scope.isEmptyComment = true;
    
    if ($scope.loggedIn) {
        favoriteFactory.get(
            function (response) {
                $scope.favorites = response.dishes;
                $scope.showMenu = true;
                $scope.isEmptyFav = ($scope.favorites === undefined || $scope.favorites.length === 0);
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            }
        );
    }
    
    if ($scope.loggedIn) {
        usercommentFactory.query(
            function (response) {
                console.log(response);
                var userId = response[response.length - 1].userId;
                var dish = [];
                for (var i = 0; i < response.length - 1; i++) {
                    for (var j = response[i].comments.length-1; j >= 0; j--) {
                        if (response[i].comments[j].postedBy === null || userId !== response[i].comments[j].postedBy._id) {
                            response[i].comments.splice(j,1);
                        } else {
                            var stars = [];
                            for (var k = 0; k < response[i].comments[j].rating; k++) {
                                stars.push(k);
                            }
                            response[i].comments[j]['star'] = stars;
                        }
                    }
                    dish.push(response[i]);
                }
                $scope.commentedDish = dish;
                $scope.isEmptyComment = ($scope.commentedDish.length === 0);
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
            }
        );
    }
    
    $scope.deleteComment = function(dishId, commentId) {
        commentFactory.delete({id:dishId, commentId:commentId})
        .$promise.then(
            function(response) {
                $state.go($state.current, {}, {reload: true});
            }
        );
    }
    
    $scope.deleteFavorite = function(dishid) {
        console.log('Delete favorites', dishid);
        favoriteFactory.delete({id: dishid})
        .$promise.then(
            function(response) {
                $state.go($state.current, {}, {reload: true});
            }
        );
    }
    
}]);
                                        
