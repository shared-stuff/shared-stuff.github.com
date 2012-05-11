(function() {
  var FriendsStuffController, focus, log;

  log = utils.log;

  focus = utils.focus;

  FriendsStuffController = function($scope, $defer, friendDAO, friendsStuffDAO) {
    $scope.stuffList = [];
    $scope.sortAttribute = '-modified';
    $scope.sortAttributeNames = {
      '-modified': 'Newest',
      'title': 'Title',
      'owner.name': 'Friend'
    };
    $defer(function() {
      return friendsStuffDAO.list(function(stuffList) {
        $scope.stuffList = stuffList;
        return $scope.$digest();
      });
    });
    return $scope.sortBy = function(sortAttribute) {
      log(sortAttribute);
      return $scope.sortAttribute = sortAttribute;
    };
  };

  FriendsStuffController.$inject = ['$scope', '$defer', 'friendDAO', 'friendsStuffDAO'];

  this.FriendsStuffController = FriendsStuffController;

}).call(this);
