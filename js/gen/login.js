(function() {
  var LoginController, log, rs;

  log = utils.log;

  rs = remoteStorageUtils;

  LoginController = function($scope, $location, settingsDAO) {
    log("Login");
    $scope.session.isLoggedIn = false;
    $scope.userAddress = "shybyte@owncube.com";
    return $scope.login = function() {
      var userAddress;
      try {
        userAddress = $scope.userAddress;
        log("userAddress:" + userAddress);
        if (userAddress) {
          return rs.connect(userAddress, function(error, storageInfo) {
            return rs.authorize(['public', 'sharedstuff'], function(token) {
              var targetPath;
              localStorage.setItem('userAddress', userAddress);
              $scope.setLoggenOn();
              targetPath = sessionStorage.getItem('targetPath') || '/';
              sessionStorage.removeItem('targetPath');
              return $scope.$apply(function() {
                return $location.path(targetPath);
              });
            });
          });
        } else {
          return alert("Please enter a remote storage id!");
        }
      } catch (e) {
        return log(e);
      }
    };
  };

  LoginController.$inject = ['$scope', '$location', 'settingsDAO'];

  this.LoginController = LoginController;

}).call(this);
