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
    console.log();
    createSliderUI(info.timestamps);
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
    
    var scaleFactor = 0.1;
    var area = attributeValue * scaleFactor;
    
    return Math.sqrt(area/Math.PI);
}

// Create time slider 

function createSliderUI(timestamps) {
    var sliderControl = L.control({ position: 'topleft'} );
    
      sliderControl.onAdd = function(map) {
        var slider = L.DomUtil.create('input', 'range-slider');
        L.DomEvent.addListener(slider, 'mousedown', function(e) {
            
            L.DomEvent.stopPropagation(e);
            map.dragging.disable(e);
            map.dragging.enable(e)
        });
        
        var labels = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019'];
        
        $(slider)
            .attr({
                'type' : 'range',
                'max' : timestamps[timestamps.length-1],
                'min' : timestamps[0],
                'step' : 1,
                'value' : String(timestamps[0])
            })
            .on('input change', function() {
                updatePropSymbols($(this).val().toString());
                var i = $.inArray(this.value,timestamps);
                $('.temporal-legend').text(labels[i]);
        });
    return slider;
    }
    sliderControl.addTo(mapND);
    createTimeLabel('2010');
}

// Create time slider labels

function createTimeLabel(startTimestamp) {
    var temporalLegend = L.control({position: 'topleft'});
    temporalLegend.onAdd = function(mapND) {
        var output = L.DomUtil.create("output", "temporal-legend");
        $(output).text(startTimestamp);
        return output;
    }
    temporalLegend.addTo(mapND);
}