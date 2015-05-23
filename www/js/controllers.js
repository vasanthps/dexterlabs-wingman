angular.module('wingmanModule', [])

.controller('homeCtrl', function($scope, $ionicModal, $timeout, $cordovaGeolocation, $cordovaOauth, $http, ngDialog, $rootScope) {
  // Form data for the login modal
  $scope.viewModel = {};
    
    var map = {};
    console.log('controller')
    var posOptions = {timeout: 10000, enableHighAccuracy: true};
     $cordovaGeolocation.getCurrentPosition(posOptions).then(function(data) {
        $scope.viewModel = data.coords;
         console.log(data.coords);
         var mapOptions = {
            center: new google.maps.LatLng(data.coords.latitude, data.coords.longitude),
            zoom: 18,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
         addMarker(map, {
             pos: new google.maps.LatLng($scope.viewModel.latitude, $scope.viewModel.longitude),
             title: 'Your location'
         })
        
         getPlaces($http, data.coords).
  success(function(data, status, headers, config) {
    // this callback will be called asynchronously
    // when the response is available
             var result = parseFsJson(data);
             for(var i in result) {
                 var marker = addMarker(map, {
                     pos: new google.maps.LatLng(result[i].lat, result[i].lng),
                     title: result[i].name,
                     icon: result[i].icon
                 })
                 google.maps.event.addListener(marker, 'click', function(e) {
                    showDetails(result, e, ngDialog, $rootScope);
                  });
             }
  }).
  error(function(data, status, headers, config) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
    
  });
         
    }, function(err) {
        console.log(err);
    })
    
})


function addMarker(map, opts) {
    var opt = {
        position: opts.pos,
        map: map,
        title: opts.title
    }
    if(opts.icon) {
        opt.icon = opts.icon;
    }
    var marker = new google.maps.Marker(opt);
    
    return marker;
}

function getPlaces(http, pos) {
     var url = 'https://api.foursquare.com/v2/venues/search?client_id=FUZ3URZEP1H43O4SS3XRADFGJIOE2HWY3JVZASKUTHBVYRRI&client_secret=PJE0R5WD5BTZUBPOWKDAOE5JDSQ20U4Z44US4S1DHRRQUYXI&v= 20140806&m=foursquare';
    
    url += '&ll=' + pos.latitude + ',' + pos.longitude;
    
    return http.get(url);
    
}

function getTweets(oauth, pos) {
    oauth.twitter('53380003-2tdekQGZGgnU9voBdJ89ktprv8Vsso8ciNuPj4coZ', '1T4vm4b4KjA8amFX5Tn7whEJHRNysEvJ7nrrfNe4ci57i').then(function(r) {
        //retrieve oAuth token from result
        console.log('twitter login success');
        console.log(r);
       
    }, function(error) {
        //show error
        console.log('twitter error');
        console.log(error);
        
    });
}

function parseFsJson(json) {
    var result = [];
    
    for(var i in json.response.venues) {
        var newPlace = {};
        newPlace.name = json.response.venues[i].name;
        newPlace.id = json.response.venues[i].id;
        newPlace.lat = json.response.venues[i].location.lat;
        newPlace.lng = json.response.venues[i].location.lng;
        newPlace.address = json.response.venues[i].location.formattedAddress;
        
        var cat = json.response.venues[i].categories[0];
        
        if(cat) {
            if(cat.name.toUpperCase() === 'OFFICE') {
                continue;
            }
        } else {
            cat = 'Unknown';
        }
        
        
        newPlace.cat = cat.name;
        newPlace.checkinsCount = json.response.venues[i].stats.checkinsCount;
        result.push(newPlace);
    }
    
    var maxcheckin = 0;
    for(var i in result) {
        
        if(result[i].checkinsCount > maxcheckin) {
            maxcheckin = result[i].checkinsCount;
        }
    }
    
    var hotness = maxcheckin - (maxcheckin*0.8);
    var good = maxcheckin - (maxcheckin * 0.2);
    
    for(var i in result) {
        
        if(result[i].checkinsCount > hotness) {
            result[i].icon = '../img/hot.png';
        } else if(result[i].checkinsCount > good) {
            result[i].icon = '../img/good.png';
        } else {
            result[i].icon = '../img/dull.png';
        }
    }
    
    console.log(result);
    return result;
    
}

function showDetails(result, e, ngDialog, scope) {
    console.log(e);
    for(var i in result) {
        if(result[i].lat.toFixed(5) === e.latLng.A.toFixed(5) && result[i].lng.toFixed(5) === e.latLng.F.toFixed(5)) {
            
            scope.result = result[i];
            console.log(scope.result);
            ngDialog.open({ template: '../templates/login.html' });
            break;
        }
    }
}