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
	map = new google.maps.Map(document.getElementById("map_canvas"),
		myOptions);
	makeRequest();
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
			google.maps.event.addListener(bikeRacks[i], 'click', showMarkers);
			infowindow = new google.maps.InfoWindow();
		}
	}
}

function showMarkers(event) {
	contentString = "<b><h3>" + this.get("rackLocation") + "</b></h3>";
	contentString += "<b>Type:</b> " + this.get("rackType") + "<br />";
	contentString += "<b>Spaces:</b> " + this.get("rackSpaces") + "<br />";
	contentString += "<b>Availability: </b> " + this.get("rackAvailability") + "<br />";
	infowindow.setContent(contentString);
	infowindow.setPosition(event.latLng);
	infowindow.open(map);
}