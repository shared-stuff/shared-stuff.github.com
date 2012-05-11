(function() {
  var LoginController, log, rs;

  log = utils.log;

  rs = remoteStorageUtils;

  LoginController = function($scope, settingsDAO) {
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
              var targetUrl;
              localStorage.setItem('userAddress', userAddress);
              targetUrl = sessionStorage.getItem('targetHref') || 'index.html';
              sessionStorage.removeItem('targetHref');
              window.location.replace(targetUrl);
              return $scope.setLoggenOn();
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

  LoginController.$inject = ['$scope', 'settingsDAO'];

  this.LoginController = LoginController;

}).call(this);
