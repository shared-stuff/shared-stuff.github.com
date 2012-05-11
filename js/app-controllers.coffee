log = utils.log
focus = utils.focus


AppController = ($scope,$location,settingsDAO)->
  $scope.logout = ->
    remoteStorageUtils.deleteToken();
    $location.path('/login')

  $scope.setLoggenOn = ->
    $scope.session = {
      userAddress: localStorage.getItem('userAddress')
      isLoggedIn: true
    }
    $scope.$digest();

  remoteStorageUtils.isLoggedOn (isLoggedOn) ->
    if (isLoggedOn)
      $scope.setLoggenOn()
    else
      $scope.session = {
        userAddress: null
        isLoggedIn: false
      }
      href = window.location.href
      loginHash = '#login'
      if href.indexOf(loginHash)>0
        sessionStorage.setItem('targetHref',window.location.href)
      else
        sessionStorage.setItem('targetHref','#')
      window.location.replace(loginHash);


  #settingsDAO.readSettings (settings)->
  #  $scope.session.settings = settings

AppController.$inject = ['$scope','$location','settingsDAO']


#export
this.AppController = AppController