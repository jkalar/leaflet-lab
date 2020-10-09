/* Javascript for Proportional Symbol Map by Jeff Kalar, October 2020 */


var mapND = L.map('mapid').setView([47.589199, -100.337102], 7);

// Load basemap layer

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(mapND);

// Load geojson data

$.getJSON("data/citiesND.geojson")
.done(function(data) {

});

function processData(data) {
    var timestamps = [];
    var min = Infinity;
    var max = -Infinity;
    
    for (var feature in data.features) {
        var properties = data.features[feature].properties;
        for (var attribute in properties) {
            if ( attribute != 'id' &&
                 attribute != 'name' &&
                 attribute != 'latitude' &&
                 attribute != 'longitude' )
            
            {
                 if ( $.inArray(attribute,timestamps) === -1) {
                     timestamps.push(attribute);
                 }
                 if (properties[attribute] < min) {
                     min = properties[attribute];
                 }
                 if (properties[attribute] > max) {
                     max = properties[attribute];
                 }
            }
        }
    }
    return {
        timestamps : timestamps,
        min : min,
        max : max
    }
}

