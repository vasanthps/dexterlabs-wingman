angular.module('wingmanModule')

.service('locationService', ['$cordovaGeolocation', function($cordovaGeolocation) {
    
    this.getCurrent = function() {
        var posOptions = {timeout: 10000, enableHighAccuracy: true};
          return $cordovaGeolocation.getCurrentPosition(posOptions)
    };
    
}]);