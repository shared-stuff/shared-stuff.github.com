(function() {
  'use strict';
  var FriendsStuffDAO, LocalStorageDAO, MY_STUFF_KEY, MyStuffDAO, PROFILE_KEY, PUBLIC_KEY, PUBLIC_PREFIX, ProfileDAO, PublicRemoteStorageService, RS_CATEGORY, RemoteStorageDAO, SettingsDAO, defer, doNothing, focus, friendDAO, getFriendStuffKey, isBlank, log, publicRemoteStorageService, randomString, rs, settingsDAO,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  log = utils.log;

  isBlank = utils.isBlank;

  focus = utils.focus;

  doNothing = utils.doNothing;

  randomString = utils.randomString;

  defer = utils.defer;

  RS_CATEGORY = "sharedstuff";

  MY_STUFF_KEY = "myStuffList";

  PUBLIC_PREFIX = "sharedstuff-";

  PUBLIC_KEY = "public";

  PROFILE_KEY = PUBLIC_PREFIX + "profile";

  rs = remoteStorageUtils;

  RemoteStorageDAO = (function() {

    function RemoteStorageDAO(category, key) {
      this.category = category;
      this.key = key;
    }

    RemoteStorageDAO.prototype.readAllItems = function(callback) {
      var self;
      self = this;
      if (self.dataCache) {
        return defer(function() {
          return callback(self.dataCache.items);
        });
      } else {
        return rs.getItem(this.category, this.key, function(error, data) {
          self.dataCache = JSON.parse(data || '{"items":[]}');
          if (!self.dataCache.items) {
            self.dataCache = {
              items: []
            };
          }
          return callback(self.dataCache.items);
        });
      }
    };

    RemoteStorageDAO.prototype.findItemByID = function(items, id) {
      return _.find(items, function(it) {
        return it.id === id;
      });
    };

    RemoteStorageDAO.prototype.list = function(callback) {
      return this.readAllItems(callback);
    };

    RemoteStorageDAO.prototype.getItem = function(id, callback) {
      return this.readAllItems(function(items) {
        return callback(_.find(items, function(it) {
          return it.id === id;
        }));
      });
    };

    RemoteStorageDAO.prototype.save = function(allItems, callback) {
      utils.cleanObjectFromAngular(allItems);
      if (!this.dataCache) this.dataCache = {};
      this.dataCache.items = allItems;
      return rs.setItem(this.category, this.key, JSON.stringify(this.dataCache), callback);
    };

    RemoteStorageDAO.prototype.saveItem = function(item, callback) {
      var self;
      self = this;
      return this.readAllItems(function(items) {
        var oldItem;
        oldItem = self.findItemByID(items, item.id);
        if (oldItem) {
          items[_.indexOf(items, oldItem)] = item;
        } else {
          items.push(item);
        }
        return self.save(items, callback);
      });
    };

    RemoteStorageDAO.prototype.deleteItem = function(id, callback) {
      var self;
      self = this;
      return this.readAllItems(function(items) {
        var oldItem;
        oldItem = self.findItemByID(items, id);
        return self.save(_.without(items, oldItem), callback);
      });
    };

    return RemoteStorageDAO;

  })();

  MyStuffDAO = (function(_super) {

    __extends(MyStuffDAO, _super);

    function MyStuffDAO(category, key, settingsDAO) {
      this.category = category;
      this.key = key;
      this.settingsDAO = settingsDAO;
    }

    MyStuffDAO.prototype.save = function(allItems, callback) {
      var publicStuff;
      MyStuffDAO.__super__.save.call(this, allItems, callback);
      this.settingsDAO.getSecret(function(secret) {
        return rs.setItem('public', PUBLIC_PREFIX + secret, JSON.stringify(allItems), doNothing);
      });
      publicStuff = _.filter(allItems, function(item) {
        return item.visibility === 'public';
      });
      return rs.setItem('public', PUBLIC_PREFIX + PUBLIC_KEY, JSON.stringify(publicStuff), doNothing);
    };

    return MyStuffDAO;

  })(RemoteStorageDAO);

  LocalStorageDAO = (function() {

    function LocalStorageDAO(key) {
      this.key = key;
    }

    LocalStorageDAO.prototype.readAllItems = function() {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    };

    LocalStorageDAO.prototype.findItemByID = function(items, id) {
      return _.find(items, function(it) {
        return it.id === id;
      });
    };

    LocalStorageDAO.prototype.list = function(callback) {
      return callback(this.readAllItems());
    };

    LocalStorageDAO.prototype.getItem = function(id, callback) {
      return callback(_.find(this.readAllItems(), function(it) {
        return it.id === id;
      }));
    };

    LocalStorageDAO.prototype.save = function(allItems) {
      utils.cleanObjectFromAngular(allItems);
      return localStorage.setItem(this.key, JSON.stringify(allItems));
    };

    LocalStorageDAO.prototype.saveItem = function(item) {
      var items, oldItem;
      items = this.readAllItems();
      oldItem = this.findItemByID(items, item.id);
      items[_.indexOf(items, oldItem)] = item;
      return this.save(items);
    };

    LocalStorageDAO.prototype.deleteItem = function(id) {
      var items, oldItem;
      items = this.readAllItems();
      oldItem = this.findItemByID(items, id);
      return this.save(_.without(items, oldItem));
    };

    return LocalStorageDAO;

  })();

  SettingsDAO = (function() {

    function SettingsDAO() {
      this.settings = null;
      this.key = 'settings';
    }

    SettingsDAO.prototype.readSettings = function(callback) {
      var self;
      self = this;
      if (self.settings) {
        return defer(function() {
          return callback(self.settings);
        });
      } else {
        return rs.getItem(RS_CATEGORY, self.key, function(error, data) {
          var settings;
          settings = JSON.parse(data || '{}');
          self.settings = settings;
          if (!settings.secret) {
            settings.secret = randomString(20);
            return self.saveSettings(callback);
          } else {
            return callback(settings);
          }
        });
      }
    };

    SettingsDAO.prototype.getSecret = function(callback) {
      var self;
      self = this;
      return this.readSettings(function(settings) {
        return callback(settings.secret);
      });
    };

    SettingsDAO.prototype.saveSettings = function(callback) {
      var self;
      self = this;
      return rs.setItem(RS_CATEGORY, self.key, JSON.stringify(self.settings), function() {
        return callback(self.settings);
      });
    };

    return SettingsDAO;

  })();

  ProfileDAO = (function() {

    function ProfileDAO(publicRemoteStorageService) {
      this.publicRemoteStorageService = publicRemoteStorageService;
      this.profile = null;
      this.key = PROFILE_KEY;
    }

    ProfileDAO.prototype.load = function(callback) {
      var self;
      self = this;
      if (self.profile) {
        return defer(function() {
          return callback(self.profile);
        });
      } else {
        return rs.getItem('public', self.key, function(error, data) {
          self.profile = JSON.parse(data || '{}');
          return callback(new Profile(self.profile));
        });
      }
    };

    ProfileDAO.prototype.save = function(profile, callback) {
      var self;
      self = this;
      self.profile = profile;
      return rs.setItem('public', self.key, JSON.stringify(self.profile), function() {
        return callback(self.profile);
      });
    };

    ProfileDAO.prototype.getByFriend = function(friend, callback) {
      return this.publicRemoteStorageService.get(friend.userAddress, this.key, {}, function(result) {
        return callback(new Profile(result));
      });
    };

    return ProfileDAO;

  })();

  PublicRemoteStorageService = (function() {

    function PublicRemoteStorageService() {
      this.clientByUserAddress = {};
    }

    PublicRemoteStorageService.prototype.get = function(userAddress, key, defaultValue, callback) {
      var self;
      self = this;
      if (!userAddress) {
        log("Missing UserAdress!");
        return callback(defaultValue);
      } else if (this.clientByUserAddress[userAddress]) {
        return this.getByClient(this.clientByUserAddress[userAddress], key, defaultValue, callback);
      } else {
        return remoteStorage.getStorageInfo(userAddress, function(error, storageInfo) {
          var client;
          if (storageInfo) {
            client = remoteStorage.createClient(storageInfo, 'public');
            self.clientByUserAddress[userAddress] = client;
            return self.getByClient(client, key, defaultValue, callback);
          } else {
            log(error);
            return callback(defaultValue, error);
          }
        });
      }
    };

    PublicRemoteStorageService.prototype.getByClient = function(client, key, defaultValue, callback) {
      return client.get(key, function(err, data) {
        if (data) {
          return callback(JSON.parse(data));
        } else {
          return callback(defaultValue);
        }
      });
    };

    return PublicRemoteStorageService;

  })();

  FriendsStuffDAO = (function() {

    function FriendsStuffDAO(friendDAO, publicRemoteStorageDAO) {
      this.friendDAO = friendDAO;
      this.publicRemoteStorageDAO = publicRemoteStorageDAO;
      this.friendsStuffList = [];
    }

    FriendsStuffDAO.prototype.listStuffByFriend = function(friend, callback) {
      return this.publicRemoteStorageDAO.get(friend.userAddress, getFriendStuffKey(friend), [], callback);
    };

    FriendsStuffDAO.prototype.validateFriend = function(friend, callback) {
      if (!utils.isBlank(friend.userAddress)) {
        return remoteStorage.getStorageInfo(friend.userAddress, function(error, storageInfo) {
          var client;
          if (storageInfo) {
            client = remoteStorage.createClient(storageInfo, 'public');
            return client.get(getFriendStuffKey(friend), function(err, data) {
              if (data) {
                return callback([]);
              } else {
                log(err);
                return callback(['secret']);
              }
            });
          } else {
            log(error);
            return callback(['userAddress']);
          }
        });
      } else {
        return callback(['userAddress']);
      }
    };

    FriendsStuffDAO.prototype.clearCache = function() {
      return this.friendsStuffList = [];
    };

    FriendsStuffDAO.prototype.list = function(callback) {
      var self;
      self = this;
      return this.friendDAO.list(function(friends) {
        var bindUpdateToFriend, friend, loadedCounter, _i, _len, _results;
        loadedCounter = 0;
        if (friends.length === 0) callback(self.friendsStuffList, 'NO_FRIENDS');
        _results = [];
        for (_i = 0, _len = friends.length; _i < _len; _i++) {
          friend = friends[_i];
          bindUpdateToFriend = function(friend) {
            return function(friendStuff) {
              self._updateWithLoadedItems(friend, friendStuff);
              loadedCounter++;
              return callback(self.friendsStuffList, loadedCounter === friends.length ? 'LOADED' : 'LOADING');
            };
          };
          _results.push(self.listStuffByFriend(friend, bindUpdateToFriend(friend)));
        }
        return _results;
      });
    };

    FriendsStuffDAO.prototype._updateWithLoadedItems = function(friend, friendStuff) {
      var existingItem, stuff, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = friendStuff.length; _i < _len; _i++) {
        stuff = friendStuff[_i];
        stuff.owner = friend;
        existingItem = _.find(this.friendsStuffList, function(it) {
          return it.id === stuff.id;
        });
        if (existingItem) {
          _results.push(this.friendsStuffList[_.indexOf(this.friendsStuffList, existingItem)] = stuff);
        } else {
          _results.push(this.friendsStuffList.push(stuff));
        }
      }
      return _results;
    };

    return FriendsStuffDAO;

  })();

  getFriendStuffKey = function(friend) {
    return PUBLIC_PREFIX + (!isBlank(friend.secret) ? friend.secret : "public");
  };

  friendDAO = new RemoteStorageDAO(RS_CATEGORY, 'myFriendsList');

  settingsDAO = new SettingsDAO();

  publicRemoteStorageService = new PublicRemoteStorageService();

  angular.module('myApp.services', []).value('version', '0.1').value('settingsDAO', settingsDAO).value('stuffDAO', new MyStuffDAO(RS_CATEGORY, MY_STUFF_KEY, settingsDAO)).value('friendDAO', friendDAO).value('friendsStuffDAO', new FriendsStuffDAO(friendDAO, publicRemoteStorageService)).value('profileDAO', new ProfileDAO(publicRemoteStorageService));

}).call(this);
