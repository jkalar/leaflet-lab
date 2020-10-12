/* Javascript for Proportional Symbol Map by Jeff Kalar, October 2020 */


var mlbPayroll = L.map('mapid').setView([37.555555, -97.633491], 4);

// Load basemap layer

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
    minZoom: 3,
	maxZoom: 18,
}).addTo(mlbPayroll); 

var southWest = L.latLng(13.777645, -65.219521),
    northEast = L.latLng(53.591362, -135.332475);
var bounds = L.latLngBounds(southWest, northEast);

mlbPayroll.setMaxBounds(bounds);
mlbPayroll.on('drag', function(){
    mlbPayroll.panInsideBounds(bounds, { animate: false });
});

// Load geojson data

$.getJSON("data/mlbPayroll.geojson")
.done(function(data) {
    var info = processData(data);
    createPropSymbols(info.timestamps, data);
    createSliderUI(info.timestamps);
    createLegend(info.min, info.max);
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
    
    mlbStadiums = L.geoJson(data, {
        
        pointToLayer: function(feature, LatLng) {
            return L.circleMarker(LatLng, {
                fillColor: "red",
                color: 'red',
                weight: 1,
                fillOpacity: 0.5
            }).on({
                mouseover: function(e) {
                    this.openPopup();
                    this.setStyle({fillColor: 'white'});
                },
                mouseout: function(e) {
                    this.closePopup();
                    this.setStyle({fillColor: ''});
                }
            });
        }
    }).addTo(mlbPayroll);
    
    updatePropSymbols(timestamps[0]);
}

// Function to resize each marker according to value

function updatePropSymbols(timestamp) {
    
    mlbStadiums.eachLayer(function(layer) {
        
        var props = layer.feature.properties;
        var radius = calcPropRadius(props[timestamp]);
        
        var popupContent = '<p><b>' + 'Team:' + '</b></p>' + '<h2>' + props.name + '</h2>' + '<p><b>Payroll in ' + timestamp + ':</b></p> ' + '<h2>' + '$' +  String(props[timestamp]) + '</h2>' ;
        
        layer.setRadius(radius);
        layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });
    });
}

// Calculate radius of symbols based on their area

function calcPropRadius(attributeValue) {
    
    var scaleFactor = 0.0000093;
    var area = attributeValue * scaleFactor;
    
    return Math.sqrt(area/Math.PI);
}

// Create Legend

function createLegend(min, max) {

    if (min < 10) {	
        min = 10; 
    }

    function roundNumber(inNumber) {

            return (Math.round(inNumber/10) * 10);  
    }

    var legend = L.control( { position: 'bottomleft' } );

    legend.onAdd = function(map) {

    var legendContainer = L.DomUtil.create('div', 'legend');  
    var symbolsContainer = L.DomUtil.create('div', 'symbolsContainer');
    var classes = [roundNumber(min), roundNumber((max-min)/2), roundNumber(max)]; 
    var legendCircle;  
    var lastRadius = 0;
    var currentRadius;
    var margin;

    L.DomEvent.addListener(legendContainer, 'mousedown', function(e) { 
        L.DomEvent.stopPropagation(e); 
    });  

    $(legendContainer).append('<h2 id="legendTitle">PAYROLL IN $USD</h2>');

    for (var i = 0; i <= classes.length-1; i++) {  

        legendCircle = L.DomUtil.create('div', 'legendCircle');  

        currentRadius = calcPropRadius(classes[i]);

        margin = -currentRadius - lastRadius - 2;

        $(legendCircle).attr("style", "width: " + currentRadius*2 + 
            "px; height: " + currentRadius*2 + 
            "px; margin-left: " + margin + "px" );				
        $(legendCircle).append("<span class='legendValue'>"+classes[i]+"</span>");

        $(symbolsContainer).append(legendCircle);

        lastRadius = currentRadius;

    }

    $(legendContainer).append(symbolsContainer); 

    return legendContainer; 

    };

    legend.addTo(mlbPayroll);  

} // end createLegend(); 

// Create time slider 

function createSliderUI(timestamps) {
    var sliderControl = L.control({ position: 'bottomleft'} );
    
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
    sliderControl.addTo(mlbPayroll);
    createTimeLabel('2010');
}

// Create time slider labels

function createTimeLabel(startTimestamp) {
    var temporalLegend = L.control({position: 'bottomleft'});
    temporalLegend.onAdd = function(mlbPayroll) {
        var output = L.DomUtil.create("output", "temporal-legend");
        $(output).text(startTimestamp);
        return output;
    }
    temporalLegend.addTo(mlbPayroll);
}

/*$(document).ready(function() {
  $("menu").change(function(){
    if ($(this).val()!='') {
      window.location.href=$(this).val();
    }
  });
});*/