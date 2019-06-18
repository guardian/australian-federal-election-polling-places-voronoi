// http://fenixfox-studios.com/content/leaflet_geojson_&_topojson/
import * as topojson from "topojson"

L.TopoJSON = L.GeoJSON.extend({
	addData: function(jsonData) {    
		if (jsonData.type === "Topology") {
			for (var key in jsonData.objects) {
				var geojson = topojson.feature(	jsonData, jsonData.objects[key]);
				L.GeoJSON.prototype.addData.call(this, geojson);
			}
		} else {
			L.GeoJSON.prototype.addData.call(this, jsonData);
		}
	}  
});

/*

var topoLayer = new L.TopoJSON();

topoLayer.addData(self.boundaries);

topoLayer.addTo(map);

topoLayer.eachLayer(self.handleLayer);

*/