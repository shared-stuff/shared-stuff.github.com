log = utils.log
rs = remoteStorageUtils

LoginController = ($scope,settingsDAO)->
  log("Login")
  $scope.session.isLoggedIn = false
  $scope.userAddress = "shybyte@owncube.com"

  $scope.login = ->
    try
      userAddress = $scope.userAddress
      log("userAddress:"+userAddress)
      if userAddress
        rs.connect(userAddress, (error, storageInfo)->
          rs.authorize(['public', 'sharedstuff'], (token) ->
            localStorage.setItem('userAddress',userAddress);
            targetUrl = sessionStorage.getItem('targetHref') || 'index.html';
            sessionStorage.removeItem('targetHref');
            window.location.replace(targetUrl)
            $scope.setLoggenOn()
          )
        )
      else
        alert("Please enter a remote storage id!")
    catch e
      log(e)


LoginController.$inject = ['$scope','settingsDAO']

#export
this.LoginController = LoginController