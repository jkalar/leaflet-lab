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
    var info = processData(data);
    createPropSymbols(info.timestamps, data);
});

// Function to process data which acquires the year columns and min/max population values

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

// Function to map the proportional symbols

function createPropSymbols(timestamps, data) {
    
    cities = L.geoJson(data, {
        
        pointToLayer: function(feature, LatLng) {
            return L.circleMarker(LatLng, {
                fillColor: "#501e65",
                color: '#501e65',
                weight: 3,
                fillOpacity: 0.7
            }).on({
                mouseover: function(e) {
                    this.openPopup();
                    this.setStyle({fillColor: 'green'});
                },
                mouseout: function(e) {
                    this.closePopup();
                    this.setStyle({fillColor: '#501e65'});
                }
            });
        }
    }).addTo(mapND);
    
    updatePropSymbols(timestamps[0]);
}

// Function to resize each marker according to value

function updatePropSymbols(timestamp) {
    
    cities.eachLayer(function(layer) {
        
        var props = layer.feature.properties;
        var radius = calcPropRadius(props[timestamp]);
        
        var popupContent = props.name + ' ' + timestamp + ' population: ' + String(props[timestamp]) ;
        
        layer.setRadius(radius);
        layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });
    });
}

// Calculate radius of symbols based on their area

function calcPropRadius(attributeValue) {
    
    var scaleFactor = 0.002;
    var area = attributeValue * scaleFactor;
    
    return Math.sqrt(area/Math.PI);
}