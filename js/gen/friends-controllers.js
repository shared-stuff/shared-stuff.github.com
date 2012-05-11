(function() {
  var FriendEditController, FriendsController, buildInviteFriendUrl, focus, focusAndSelect, isBlank, log;

  log = utils.log;

  focus = utils.focus;

  focusAndSelect = utils.focusAndSelect;

  isBlank = utils.isBlank;

  FriendsController = function($scope, friendDAO, friendsStuffDAO, settingsDAO, $routeParams) {
    var session;
    $scope.friendList = [];
    $scope.isAddFriendFormHidden = true;
    $scope.isInviteFriendFormHidden = true;
    session = $scope.session;
    $scope.inviteUrl = 'Loading...';
    friendDAO.list(function(restoredFriendList) {
      $scope.friendList = restoredFriendList;
      $scope.isAddFriendFormHidden = $scope.friendList.length > 0;
      if ($routeParams.userAddress) {
        $scope.friend = new Friend({
          userAddress: $routeParams.userAddress,
          secret: $routeParams.secret
        });
        $scope.isAddFriendFormHidden = false;
      }
      return $scope.$digest();
    });
    $scope.showAddForm = function() {
      $scope.isAddFriendFormHidden = false;
      $scope.isInviteFriendFormHidden = true;
      return focus('name');
    };
    $scope.friend = new Friend();
    $scope.addFriend = function() {
      $scope.friend.sanitize();
      return friendsStuffDAO.validateFriend($scope.friend, function(errors) {
        if (errors.length === 0) {
          $scope.friendList.push(new Friend($scope.friend));
          friendDAO.save($scope.friendList);
          $scope.friend = new Friend();
          $scope.isAddFriendFormHidden = true;
          $scope.$digest();
          return focus('showAddFriendFormButton');
        } else {
          $scope.showValidationErrors = true;
          return window.alert(errors.join(',') + " seems invalid");
        }
      });
    };
    $scope.inviteFriend = function() {
      $scope.isInviteFriendFormHidden = false;
      $scope.isAddFriendFormHidden = true;
      return settingsDAO.getSecret(function(secret) {
        $scope.inviteUrl = buildInviteFriendUrl(session.userAddress, secret);
        $scope.$digest();
        return focusAndSelect('inviteUrl');
      });
    };
    $scope.closeInviteFriend = function() {
      return $scope.isInviteFriendFormHidden = true;
    };
    return focus('showAddFriendFormButton');
  };

  buildInviteFriendUrl = function(userAddress, secret) {
    var hash, l, part1;
    l = window.location;
    part1 = l.protocol + '//' + l.host + l.pathname;
    hash = '/addFriend/' + userAddress + '/' + secret;
    return part1 + '#' + hash;
  };

  FriendsController.$inject = ['$scope', 'friendDAO', 'friendsStuffDAO', 'settingsDAO', '$routeParams'];

  FriendEditController = function($scope, friendDAO, friendsStuffDAO, $routeParams, $location) {
    var redirectToList;
    $scope.friend = new Friend();
    $scope.editMode = false;
    $scope.stuffList = [];
    $scope.showValidationErrors = true;
    friendDAO.getItem($routeParams.id, function(friend) {
      $scope.friend = new Friend(friend);
      $scope.$digest();
      return friendsStuffDAO.listStuffByFriend(friend, function(friendStuff) {
        $scope.stuffList = friendStuff;
        return $scope.$digest();
      });
    });
    redirectToList = function() {
      return $scope.$apply(function() {
        return $location.path('/friends');
      });
    };
    $scope.save = function() {
      $scope.friend.sanitize();
      return friendsStuffDAO.validateFriend($scope.friend, function(errors) {
        if (errors.length === 0) {
          return friendDAO.saveItem($scope.friend, redirectToList);
        } else {
          return window.alert(errors.join(',') + " seems invalid");
        }
      });
    };
    $scope.showEditMode = function() {
      return $scope.editMode = true;
    };
    return $scope["delete"] = function() {
      if (window.confirm("Do you really want to delete your friend \"" + $scope.friend.name + "\"?")) {
        return friendDAO.deleteItem($scope.friend.id, redirectToList);
      }
    };
  };

  FriendEditController.$inject = ['$scope', 'friendDAO', 'friendsStuffDAO', '$routeParams', '$location'];

  this.FriendsController = FriendsController;

  this.FriendEditController = FriendEditController;

}).call(this);
