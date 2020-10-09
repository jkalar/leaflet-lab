/* Javascript by Jeff Kalar */


var mapND = L.map('mapid').setView([47.589199, -100.337102], 7);

// Load basemap layer

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(mapND);

// Load geojson data

$.getJSON("data/citiesND.geojson").done(function(data) {

})

