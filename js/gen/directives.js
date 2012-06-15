(function() {

  angular.module('myApp.directives', []).directive('appVersion', [
    'version', function(version) {
      return function(scope, elm, attrs) {
        return elm.text(version);
      };
    }
  ]).directive('appSelectOnFocus', [
    function() {
      return function(scope, elm, attrs) {
        return elm.bind('focus', function(event) {
          return setTimeout(function() {
            return elm.select();
          }, 100);
        });
      };
    }
  ]).directive('stuffImage', [
    function() {
      return function(scope, elm, attrs) {
        elm.addClass('stuffImageBox');
        return scope.$watch(attrs.src, function() {
          var image, src;
          src = attrs.src;
          if (!utils.isBlank(src)) {
            image = new Image();
            image.src = src;
            image.className = 'stuffImage';
            return elm.append(image);
          } else {
            return elm.hide();
          }
        });
      };
    }
  ]).directive('multiSelect', [
    function() {
      return {
        scope: {
          options: '=',
          values: '=',
          localizationType: '@'
        },
        template: "<div class=\"multiSelect\">\n  <span ng-repeat=\"option in options\">\n    <label class=\"checkBoxLabel\">\n      <input type=\"checkbox\" ng-model=\"selected[option]\"> {{option | localize:localizationType}}\n    </label>\n  </span>\n</div>",
        link: function($scope, elm, attrs) {
          $scope.$watch('values', function() {
            var value, _i, _len, _ref, _results;
            $scope.selected = {};
            _ref = $scope.values;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              value = _ref[_i];
              _results.push($scope.selected[value] = true);
            }
            return _results;
          });
          return $scope.$watch('selected', function() {
            var isSelected, option;
            return $scope.values = (function() {
              var _ref, _results;
              _ref = $scope.selected;
              _results = [];
              for (option in _ref) {
                isSelected = _ref[option];
                if (isSelected) _results.push(option);
              }
              return _results;
            })();
          }, true);
        }
      };
    }
  ]).directive('sharingTypesSelect', [
    function() {
      return {
        scope: {
          values: '='
        },
        template: "<div multi-select options=\"options\" values=\"values\" localization-type=\"sharingType\"/>",
        link: function($scope, elm, attrs) {
          return $scope.options = Stuff.sharingTypeValues;
        }
      };
    }
  ]).directive('sharingTypes', [
    function() {
      return {
        scope: {
          values: '='
        },
        template: "<span ng-show=\"values.length\">for {{values | sharingTypes}}</span>"
      };
    }
  ]).directive('myStuff', [
    function() {
      return {
        scope: {
          item: '=',
          profile: '='
        },
        template: "<h3><a href=\"#/mystuff/{{item.id}}\">{{item.title || \"Untitled\"}}</a><span class=\"wish\" ng-show=\"item.sharingDirection=='wish'\"> [Wish]</span></h3>\n<span stuff-image src=\"{{item.image}}\"/>\n<p class=\"description\" ng-bind-html=\"item.description | urlize\"></p>\n<p class=\"stuffFooter\">\n    <span ng-show=\"item.visibility == 'public'\" class=\"owner visibility\">Public</span>\n    {{item.categories}}\n    <span ng-show=\"item.location\">in {{item.getLocation()}}</span>\n    <span ng-show=\"!item.location && profile.location\">in your profile location {{profile.location}}</span>\n    <span sharing-types values=\"item.sharingTypes\" />\n    <a ng-show=\"item.link\" href=\"{{item.link}}\" target=\"link\">External Link</a>\n</p>"
      };
    }
  ]).directive('friendStuff', [
    function() {
      return {
        scope: {
          item: '='
        },
        template: "<h3>{{item.title || \"Untitled\"}}<span class=\"wish\" ng-show=\"item.sharingDirection=='wish'\"> [Wish]</span></h3>\n  <span stuff-image src=\"{{item.image}}\"/>\n  <p class=\"description\" ng-bind-html=\"item.description | urlize\"></p>\n  <p class=\"stuffFooter\">\n      {{item.categories}}\n      <span class=\"owner\" ng-show=\"item.owner\">from <a href=\"#/friends/{{item.owner.id}}\">{{item.owner.name}}</a></span> ({{ item.modified | date}})\n      <span ng-show=\"item.getLocation()\">in {{item.getLocation()}}</span>\n      <span sharing-types values=\"item.sharingTypes\" />\n      <a ng-show=\"item.link\" href=\"{{item.link}}\" target=\"link\">External Link</a>\n  </p>"
      };
    }
  ]);

}).call(this);
