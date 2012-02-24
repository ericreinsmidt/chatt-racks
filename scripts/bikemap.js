var map;
var infowindow;
var contentString;
var bikeRacks = [];
var image = new google.maps.MarkerImage('img/dot.png',
  new google.maps.Size(10,10)
);

function initialize() {
	var myOptions = {
		center: new google.maps.LatLng(35.047996,-85.305544),
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.HYBRID
	};
	detectBrowser();
	map = new google.maps.Map(document.getElementById("map_canvas"),
		myOptions);
	makeRequest();
	prepareGeolocation();
    doGeolocation();
}

function detectBrowser() {
  var useragent = navigator.userAgent;
  var mapdiv = document.getElementById("map_canvas");

  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapdiv.style.width = '100%';
    mapdiv.style.height = '100%';
  } else {
    mapdiv.style.width = '600px';
    mapdiv.style.height = '800px';
  }
}

function makeRequest() {
	var result = null;
	var scriptUrl = "data/bikerack.txt";
	$.ajax({
		url: scriptUrl,
		type: 'get',
		dataType: 'text',
		async: false,
		success: function(data) {
			result = data;
		} 
	});
	dispCSV(result);
}

function dispCSV(csvdoc) {
	line = csvdoc.split("\n");
	for (var i = 0; i < line.length; i++) {
		lineElem = line[i].split(/\t/); 
		for (var j = 0; j < lineElem.length; j++) {

			bikeRackCoords = new google.maps.LatLng(lineElem[1], lineElem[0]);

			bikeRacks[i] = new google.maps.Marker({
				icon: image,
				pixelOffset: new google.maps.Size(54, 75),
				position: bikeRackCoords,
				map: map,
				title: lineElem[2]
			});

			bikeRacks[i].setMap(map);
			bikeRacks[i].set("rackLocation", lineElem[2]);
			bikeRacks[i].set("rackAvailability", lineElem[3]);
			bikeRacks[i].set("rackType", lineElem[5]);
			bikeRacks[i].set("rackSpaces", lineElem[4]);
			google.maps.event.addListener(bikeRacks[i], 'click', showInfoWindow);
			infowindow = new google.maps.InfoWindow();
		}
	}
}

function showInfoWindow(event) {
	contentString = "<b><h3>" + this.get("rackLocation") + "</b></h3>";
	contentString += "<b>Type:</b> " + this.get("rackType") + "<br />";
	contentString += "<b>Spaces:</b> " + this.get("rackSpaces") + "<br />";
	contentString += "<b>Availability: </b> " + this.get("rackAvailability") + "<br />";
	infowindow.setContent(contentString);
	infowindow.setPosition(event.latLng);
	infowindow.open(map);
}

function doGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
    } else {
      positionError(-1);
    }
  }

  function positionError(err) {
    var msg;
    switch(err.code) {
      case err.UNKNOWN_ERROR:
        msg = "Unable to find your location";
        break;
      case err.PERMISSION_DENINED:
        msg = "Permission denied in finding your location";
        break;
      case err.POSITION_UNAVAILABLE:
        msg = "Your location is currently unknown";
        break;
      case err.BREAK:
        msg = "Attempt to find location took too long";
        break;
      default:
        msg = "Location detection not supported in browser";
    }
    document.getElementById('info').innerHTML = msg;
  }

  function positionSuccess(position) {
    // Centre the map on the new location
    var coords = position.coords || position.coordinate || position;
    var latLng = new google.maps.LatLng(coords.latitude, coords.longitude);
    map.setCenter(latLng);
    map.setZoom(12);
    var marker = new google.maps.Marker({
	    map: map,
	    position: latLng,
	    title: 'Why, there you are!'
    });
    document.getElementById('info').innerHTML = 'Looking for <b>' +
        coords.latitude + ', ' + coords.longitude + '</b>...';

    // And reverse geocode.
    (new google.maps.Geocoder()).geocode({latLng: latLng}, function(resp) {
		  var place = "You're around here somewhere!";
		  if (resp[0]) {
			  var bits = [];
			  for (var i = 0, I = resp[0].address_components.length; i < I; ++i) {
				  var component = resp[0].address_components[i];
				  if (contains(component.types, 'political')) {
					  bits.push('<b>' + component.long_name + '</b>');
					}
				}
				if (bits.length) {
					place = bits.join(' > ');
				}
				marker.setTitle(resp[0].formatted_address);
			}
			document.getElementById('info').innerHTML = place;
	  });
  }

  function contains(array, item) {
	  for (var i = 0, I = array.length; i < I; ++i) {
		  if (array[i] == item) return true;
		}
		return false;
	}

// From
// http://google-ajax-examples.googlecode.com/svn/trunk/whereareyou/scripts/geometa.js
function prepareGeolocation(opt_force) {
if ( opt_force || typeof navigator.geolocation == "undefined" || navigator.geolocation.shim ) (function(){

// -- BEGIN GEARS_INIT
(function() {
  // We are already defined. Hooray!
  if (window.google && google.gears) {
    return;
  }

  var factory = null;

  // Firefox
  if (typeof GearsFactory != 'undefined') {
    factory = new GearsFactory();
  } else {
    // IE
    try {
      factory = new ActiveXObject('Gears.Factory');
      // privateSetGlobalObject is only required and supported on WinCE.
      if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
        factory.privateSetGlobalObject(this);
      }
    } catch (e) {
      // Safari
      if ((typeof navigator.mimeTypes != 'undefined')
           && navigator.mimeTypes["application/x-googlegears"]) {
        factory = document.createElement("object");
        factory.style.display = "none";
        factory.width = 0;
        factory.height = 0;
        factory.type = "application/x-googlegears";
        document.documentElement.appendChild(factory);
      }
    }
  }

  // *Do not* define any objects if Gears is not installed. This mimics the
  // behavior of Gears defining the objects in the future.
  if (!factory) {
    return;
  }

  // Now set up the objects, being careful not to overwrite anything.
  //
  // Note: In Internet Explorer for Windows Mobile, you can't add properties to
  // the window object. However, global objects are automatically added as
  // properties of the window object in all browsers.
  if (!window.google) {
    google = {};
  }

  if (!google.gears) {
    google.gears = {factory: factory};
  }
})();
// -- END GEARS_INIT

var GearsGeoLocation = (function() {
    // -- PRIVATE
    var geo = google.gears.factory.create('beta.geolocation');

    var wrapSuccess = function(callback, self) { // wrap it for lastPosition love
        return function(position) {
            callback(position);
            self.lastPosition = position;
        }
    }

    // -- PUBLIC
    return {
        shim: true,

        type: "Gears",

        lastPosition: null,

        getCurrentPosition: function(successCallback, errorCallback, options) {
            var self = this;
            var sc = wrapSuccess(successCallback, self);
            geo.getCurrentPosition(sc, errorCallback, options);
        },

        watchPosition: function(successCallback, errorCallback, options) {
            geo.watchPosition(successCallback, errorCallback, options);
        },

        clearWatch: function(watchId) {
            geo.clearWatch(watchId);
        },

        getPermission: function(siteName, imageUrl, extraMessage) {
            geo.getPermission(siteName, imageUrl, extraMessage);
        }

    };
})();

var AjaxGeoLocation = (function() {
    // -- PRIVATE
    var loading = false;
    var loadGoogleLoader = function() {
        if (!hasGoogleLoader() && !loading) {
            loading = true;
            var s = document.createElement('script');
            s.src = 'http://www.google.com/jsapi?callback=_google_loader_apiLoaded';
            s.type = "text/javascript";
            document.getElementsByTagName('body')[0].appendChild(s);
        }
    };

    var queue = [];
    var addLocationQueue = function(callback) {
        queue.push(callback);
    }

    var runLocationQueue = function() {
        if (hasGoogleLoader()) {
            while (queue.length > 0) {
                var call = queue.pop();
                call();
            }
        }
    }

    window['_google_loader_apiLoaded'] = function() {
        runLocationQueue();
    }

    var hasGoogleLoader = function() {
        return (window['google'] && google['loader']);
    }

    var checkGoogleLoader = function(callback) {
        if (hasGoogleLoader()) return true;

        addLocationQueue(callback);

        loadGoogleLoader();

        return false;
    };

    loadGoogleLoader(); // start to load as soon as possible just in case

    // -- PUBLIC
    return {
        shim: true,

        type: "ClientLocation",

        lastPosition: null,

        getCurrentPosition: function(successCallback, errorCallback, options) {
            var self = this;
            if (!checkGoogleLoader(function() {
                self.getCurrentPosition(successCallback, errorCallback, options);
            })) return;

            if (google.loader.ClientLocation) {
                var cl = google.loader.ClientLocation;

                var position = {
                    latitude: cl.latitude,
                    longitude: cl.longitude,
                    altitude: null,
                    accuracy: 43000, // same as Gears accuracy over wifi?
                    altitudeAccuracy: null,
                    heading: null,
                    velocity: null,
                    timestamp: new Date(),

                    // extra info that is outside of the bounds of the core API
                    address: {
                        city: cl.address.city,
                        country: cl.address.country,
                        country_code: cl.address.country_code,
                        region: cl.address.region
                    }
                };

                successCallback(position);

                this.lastPosition = position;
            } else if (errorCallback === "function")  {
                errorCallback({ code: 3, message: "Using the Google ClientLocation API and it is not able to calculate a location."});
            }
        },

        watchPosition: function(successCallback, errorCallback, options) {
            this.getCurrentPosition(successCallback, errorCallback, options);

            var self = this;
            var watchId = setInterval(function() {
                self.getCurrentPosition(successCallback, errorCallback, options);
            }, 10000);

            return watchId;
        },

        clearWatch: function(watchId) {
            clearInterval(watchId);
        },

        getPermission: function(siteName, imageUrl, extraMessage) {
            // for now just say yes :)
            return true;
        }

    };
})();

// If you have Gears installed use that, else use Ajax ClientLocation
navigator.geolocation = (window.google && google.gears && google.gears.factory.create) ? GearsGeoLocation : AjaxGeoLocation;

})();
}


/*



  var map;
  function initialise() {
    var latlng = new google.maps.LatLng(-25.363882,131.044922);
    var myOptions = {
      zoom: 4,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      disableDefaultUI: true
    }
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    prepareGeolocation();
    doGeolocation();
  }

  function doGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
    } else {
      positionError(-1);
    }
  }

  function positionError(err) {
    var msg;
    switch(err.code) {
      case err.UNKNOWN_ERROR:
        msg = "Unable to find your location";
        break;
      case err.PERMISSION_DENINED:
        msg = "Permission denied in finding your location";
        break;
      case err.POSITION_UNAVAILABLE:
        msg = "Your location is currently unknown";
        break;
      case err.BREAK:
        msg = "Attempt to find location took too long";
        break;
      default:
        msg = "Location detection not supported in browser";
    }
    document.getElementById('info').innerHTML = msg;
  }

  function positionSuccess(position) {
    // Centre the map on the new location
    var coords = position.coords || position.coordinate || position;
    var latLng = new google.maps.LatLng(coords.latitude, coords.longitude);
    map.setCenter(latLng);
    map.setZoom(12);
    var marker = new google.maps.Marker({
	    map: map,
	    position: latLng,
	    title: 'Why, there you are!'
    });
    document.getElementById('info').innerHTML = 'Looking for <b>' +
        coords.latitude + ', ' + coords.longitude + '</b>...';

    // And reverse geocode.
    (new google.maps.Geocoder()).geocode({latLng: latLng}, function(resp) {
		  var place = "You're around here somewhere!";
		  if (resp[0]) {
			  var bits = [];
			  for (var i = 0, I = resp[0].address_components.length; i < I; ++i) {
				  var component = resp[0].address_components[i];
				  if (contains(component.types, 'political')) {
					  bits.push('<b>' + component.long_name + '</b>');
					}
				}
				if (bits.length) {
					place = bits.join(' > ');
				}
				marker.setTitle(resp[0].formatted_address);
			}
			document.getElementById('info').innerHTML = place;
	  });
  }

  function contains(array, item) {
	  for (var i = 0, I = array.length; i < I; ++i) {
		  if (array[i] == item) return true;
		}
		return false;
	}




*/