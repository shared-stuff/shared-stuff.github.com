(function() {
  var AppController, focus, log;

  log = utils.log;

  focus = utils.focus;

  AppController = function($scope, $location, settingsDAO) {
    $scope.logout = function() {
      remoteStorageUtils.deleteToken();
      return $location.path('/login');
    };
    $scope.setLoggenOn = function() {
      $scope.session = {
        userAddress: localStorage.getItem('userAddress'),
        isLoggedIn: true
      };
      return $scope.$digest();
    };
    return remoteStorageUtils.isLoggedOn(function(isLoggedOn) {
      var href, loginHash;
      if (isLoggedOn) {
        return $scope.setLoggenOn();
      } else {
        $scope.session = {
          userAddress: null,
          isLoggedIn: false
        };
        href = window.location.href;
        loginHash = '#login';
        if (href.indexOf(loginHash) > 0) {
          sessionStorage.setItem('targetHref', window.location.href);
        } else {
          sessionStorage.setItem('targetHref', '#');
        }
        return window.location.replace(loginHash);
      }
    });
  };

  AppController.$inject = ['$scope', '$location', 'settingsDAO'];

  this.AppController = AppController;

}).call(this);
