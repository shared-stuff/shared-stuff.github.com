log = utils.log
focus = utils.focus
focusAndSelect = utils.focusAndSelect
isBlank = utils.isBlank
applyIfNeeded =  utils.applyIfNeeded



FriendsController = ($scope,friendDAO,friendsStuffDAO,settingsDAO,$routeParams)->
  $scope.friendList = []
  $scope.isAddFriendFormHidden = true
  $scope.isInviteFriendFormHidden = true
  $scope.inviteUrl = 'Loading...'

  friendDAO.list (restoredFriendList)->
    $scope.friendList = restoredFriendList
    $scope.isAddFriendFormHidden = $scope.friendList.length>0
    if ($routeParams.userAddress)
      $scope.friend = new Friend({name: $routeParams.name,userAddress: $routeParams.userAddress,secret:$routeParams.secret})
      $scope.isAddFriendFormHidden = false
    $scope.status = 'LOADED'
    $scope.$digest();

  $scope.showAddForm = ()->
    $scope.isAddFriendFormHidden = false
    $scope.isInviteFriendFormHidden = true
    focus('name')

  $scope.closeForm = ()->
    $scope.isAddFriendFormHidden = true
    $scope.isInviteFriendFormHidden = true

  $scope.friend = new Friend()

  $scope.addFriend = ()->
    $scope.friend.sanitize()
    friendsStuffDAO.validateFriend($scope.friend, (errors)->
      if errors.length==0
        $scope.friendList.push(new Friend($scope.friend))
        friendDAO.save($scope.friendList)
        $scope.friend = new Friend();
        $scope.isAddFriendFormHidden = true
        $scope.$digest();
        focus('showAddFriendFormButton')
      else
        $scope.showValidationErrors=true
        showValidationErrors($scope.friend,errors)
    )
  $scope.inviteFriend = ->
    $scope.isInviteFriendFormHidden = false
    $scope.isAddFriendFormHidden = true
    settingsDAO.getSecret (secret) ->
      userAdress = $scope.session.userAddress
      $scope.inviteUrl =  buildInviteFriendUrl(userAdress,secret)
      $scope.publicInviteUrl =  buildPublicInviteUrl(userAdress)
      $scope.$digest();
      focusAndSelect('inviteUrl')

  $scope.closeInviteFriend = ->
    $scope.isInviteFriendFormHidden = true

  focus('showAddFriendFormButton')


buildInviteFriendUrl = (userAddress,secret) ->
  return buildPublicInviteUrl(userAddress)+'/'+secret

buildPublicInviteUrl = (userAddress,secret) ->
  l = window.location
  part1 = l.protocol+'//'+l.host+ l.pathname
  hash = '/invitation/'+userAddress
  return part1+'#'+hash


FriendsController.$inject = ['$scope','friendDAO','friendsStuffDAO','settingsDAO','$routeParams']


FriendEditController = ($scope,friendDAO,friendsStuffDAO,profileDAO,$routeParams,$location)->
  $scope.friend = new Friend()
  $scope.editMode = false
  $scope.stuffList = []
  $scope.profile = {}
  $scope.showValidationErrors=true

  loadFriend = ->
    friendDAO.getItem($routeParams.id,(friend)->
      $scope.friend = new Friend(friend)
      $scope.$digest()
      friendsStuffDAO.listStuffByFriend(friend, (friendStuff) ->
          $scope.stuffList = friendStuff
          $scope.$digest()
      )
      profileDAO.getByFriend(friend,(profile) ->
        $scope.profile = new Profile(profile)
        $scope.$digest()
      )
    )

  loadFriend()

  redirectToList = ->
    $scope.$apply( ->
        $location.path('/friends')
    )

  $scope.save = ()->
    $scope.friend.sanitize()
    friendsStuffDAO.validateFriend($scope.friend, (errors)->
      if errors.length==0
        friendDAO.saveItem($scope.friend,->
          $scope.editMode = false
          loadFriend()
        )
      else
        showValidationErrors($scope.friend,errors)
    )


  $scope.showEditMode = ()->
    $scope.editMode = true

  $scope.delete = ()->
    if window.confirm("Do you really want to delete your friend \"#{$scope.friend.name}\"?")
      friendDAO.deleteItem($scope.friend.id,redirectToList)

FriendEditController.$inject = ['$scope','friendDAO','friendsStuffDAO','profileDAO','$routeParams','$location']

showValidationErrors = (friend,errors)->
  message = errors.join(',')+" seems invalid."
  if _.include(errors,'secret')
    if isBlank(friend.secret)
      message += " This could mean that your friend has not added public shared stuff yet."
    else
      message += " This could mean that your friend has not added secret shared stuff yet."
  window.alert(message)


FriendViewController = ($scope,friendDAO,friendsStuffDAO,profileDAO,$routeParams,$location)->
  $scope.stuffList = []
  friend = new Friend({userAddress:$routeParams.userAddress,secret:$routeParams.secret})
  $scope.friend = friend
  $scope.profile = {}

  friendsStuffDAO.listStuffByFriend(friend, (friendStuff) ->
    $scope.stuffList = friendStuff
    $scope.$digest()
  )

  profileDAO.getByFriend(friend,(profile) ->
    $scope.profile = new Profile(profile)
    if profile.name
      friend.name = profile.name
    else
      friend.name = friend.userAddress.replace(/@.*$/,'') || 'unkown'
    $scope.$digest()
  )

  $scope.addFriend = ->
    $location.path('/addFriend/'+friend.name+'/'+friend.userAddress+'/'+friend.secret)


FriendViewController.$inject = ['$scope','friendDAO','friendsStuffDAO','profileDAO','$routeParams','$location']

ShareStuffController = ($scope,settingsDAO)->
    settingsDAO.getSecret (secret) ->
      userAdress = $scope.session.userAddress
      $scope.inviteUrl =  buildInviteFriendUrl(userAdress,secret)
      $scope.publicInviteUrl =  buildPublicInviteUrl(userAdress)
      $scope.$digest();
      focusAndSelect('inviteUrl')

ShareStuffController.$inject = ['$scope','settingsDAO']

#export
this.FriendsController = FriendsController
this.FriendEditController = FriendEditController
this.FriendViewController = FriendViewController
this.ShareStuffController = ShareStuffController