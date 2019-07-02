var map = L.map('map',{
    minZoom: 4,
    maxZoom: 13,
    scrollWheelZoom: false
}).setView([-27, 133.772541], 4);

var styled = L.gridLayer.googleMutant({

    type: 'roadmap',

    styles: [{
	    "featureType": "water",
	    "elementType": "geometry",
	    "stylers": [
	        {
	            "color": "#92979b"
	        },
	        {
	            "lightness": 17
	        }
	    ]
	},
	{
	    "featureType": "landscape",
	    "elementType": "geometry",
	    "stylers": [
	        {
	            "color": "#f5f5f5"
	        },
	        {
	            "lightness": 20
	        }
	    ]
	},
	{
	    "featureType": "road.highway",
	    "elementType": "geometry.fill",
	    "stylers": [
	        {
	            "color": "#ffffff"
	        },
	        {
	            "lightness": 17
	        }
	    ]
	},
	{
	    "featureType": "road.highway",
	    "elementType": "geometry.stroke",
	    "stylers": [
	        {
	            "color": "#ffffff"
	        },
	        {
	            "lightness": 29
	        },
	        {
	            "weight": 0.2
	        }
	    ]
	},
	{
	    "featureType": "road.arterial",
	    "elementType": "geometry",
	    "stylers": [
	        {
	            "color": "#ffffff"
	        },
	        {
	            "lightness": 18
	        }
	    ]
	},
	{
	    "featureType": "road.local",
	    "elementType": "geometry",
	    "stylers": [
	        {
	            "color": "#ffffff"
	        },
	        {
	            "lightness": 16
	        }
	    ]
	},
	{
	    "featureType": "poi",
	    "elementType": "geometry",
	    "stylers": [
	        {
	            "color": "#f5f5f5"
	        },
	        {
	            "lightness": 21
	        }
	    ]
	},
	{
	    "featureType": "poi.park",
	    "elementType": "geometry",
	    "stylers": [
	        {
	            "color": "#dedede"
	        },
	        {
	            "lightness": 21
	        }
	    ]
	},
	{
	    "elementType": "labels.text.stroke",
	    "stylers": [
	        {
	            "visibility": "on"
	        },
	        {
	            "color": "#ffffff"
	        },
	        {
	            "lightness": 16
	        }
	    ]
	},
	{
	    "elementType": "labels.text.fill",
	    "stylers": [
	        {
	            "saturation": 36
	        },
	        {
	            "color": "#333333"
	        },
	        {
	            "lightness": 40
	        }
	    ]
	},
	{
	    "elementType": "labels.icon",
	    "stylers": [
	        {
	            "visibility": "off"
	        }
	    ]
	},
	{
	    "featureType": "transit",
	    "elementType": "geometry",
	    "stylers": [
	        {
	            "color": "#f2f2f2"
	        },
	        {
	            "lightness": 19
	        }
	    ]
	},
	{
	    "featureType": "administrative",
	    "elementType": "geometry.fill",
	    "stylers": [
	        {
	            "color": "#fefefe"
	        },
	        {
	            "lightness": 20
	        }
	    ]
	},
	{
	    "featureType": "administrative",
	    "elementType": "geometry.stroke",
	    "stylers": [
	        {
	            "color": "#fefefe"
	        },
	        {
	            "lightness": 17
	        },
	        {
	            "weight": 1.2
	        }
	    ]
	}
	]}).addTo(map);

var osm = L.tileLayer('https://interactive.guim.co.uk/gis/vote-dots/{z}/{x}/{y}.png').addTo(map);