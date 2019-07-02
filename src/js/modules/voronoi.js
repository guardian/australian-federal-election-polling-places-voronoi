import { Toolbelt } from '../modules/toolbelt'
import template from '../../templates/template.html'
import * as d3 from "d3"
import * as topojson from "topojson"
import Ractive from 'ractive'
import GoogleMapsLoader from 'google-maps';
import mapstyles from '../modules/mapstyles.json'
import L from 'leaflet'
import '../modules/Leaflet.GoogleMutant.js'

export class Voronoi {

	constructor(data, boundaries) {

        var self = this

        this.database = data

        this.boundaries = boundaries

        this.boundaryID = "PPId"

        this.zoomLevel = 1

        this.toolbelt = new Toolbelt()

        /*
        Create a set of keys based on the JSON from the Googledoc data table
        */

        this.database.keys = Object.keys( this.database.data[0] )

        /*
        Remove the ID column which is going to be used to map 
        items to their corresponding 
        boundaries in the topojson
        */

        this.database.keys = this.database.keys.filter(key => key !== 'id')

        /*
        Specify if the graphic requires a dropdown menu
        based on whether the Google doc contains more
        than one column (excluding the noew delted ID column)
        */

        this.database.dropdown = (self.database.mapping.map( (item) => item.data).length > 1) ? true : false ;

        
        /*
        Convert all the datum that looks like a number in the data columns to intergers 
        */


        this.database.data.forEach( item => {

            item.id = +item.id

            for (let i = 0; i < self.database.keys.length; i++) {

                if (!isNaN(item[self.database.keys[i]])) {

                    item[self.database.keys[i]] = (item[self.database.keys[i]]!="") ? +item[self.database.keys[i]] : null ;

                }
                
            }

        });


        /*
        Get the name of the topojson object
        */

        this.database.topoKey = Object.keys( this.boundaries.objects )[0]

        /*
        Merge the row data from the Googledoc data table to its corresponding boundary
        */

        this.boundaries.objects[this.database.topoKey].geometries.forEach( item => {

            item.properties = {...item.properties, ...self.database.data.find((datum) => datum.id === item.properties[self.boundaryID])}

        });

        /*
        Specify the current key
        */

        this.database.currentIndex = 0

        this.database.currentKey = self.database.mapping[0].data;

        this.database.allParties = (self.database.currentIndex===0) ? true : false ;


        /*
        Check to see if user is on a mobile.
        If the user is on a mobile lock the map by default
        */

        this.isMobile = self.toolbelt.mobileCheck()

        this.database.zoomOn = (self.isMobile) ? false : true ;

        this.isAndroidApp = (window.location.origin === "file://" && /(android)/i.test(navigator.userAgent) ) ? true : false ;  

        this.voronoiPolygons = null

        this.ractivate()

	}

    ractivate() {

        var self = this

        Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});
        
        this.ractive = new Ractive({
            el: '#choloropleth',
            data: self.database,
            template: template,
        })

        this.ractive.observe('currentIndex', function(index) {

            self.database.currentIndex = index

            self.database.allParties = (self.database.currentIndex===0) ? true : false ;

            self.database.currentKey = self.database.mapping[index].data

            self.ractive.set("allParties", self.database.allParties)

            self.colourizer()

            self.updateMap()

            self.keygen()

        });

        this.colourizer()

        this.keygen()

        this.googleizer()

    }

    googleizer() {

        var self = this

        GoogleMapsLoader.KEY = 'AIzaSyD8Op4vGvy_plVVJGjuC5r0ZbqmmoTOmKk';
        GoogleMapsLoader.REGION = 'AU';
        GoogleMapsLoader.load(function(google) {
            self.initMap()
        });


    }

    colourizer() {

        var self = this

        if (self.database.currentIndex===0) {

            this.color = (d) => self.scalerizer(d)

        } else {

            this.keyColors = self.database.mapping[self.database.currentIndex].colours.split(",");

            this.scaleColour = d3.scaleLinear().domain([0, 80]).range(self.keyColors); 

            this.color = (d) => self.scaleColour(d[self.database.currentKey]);

        }

    }

    scalerizer(data) {

        var self = this

        var colours = (data[self.database.currentKey]==='ALP') ? ["white","#b51800"] : 
        (data[self.database.currentKey]==='IND') ? ["white","#5623ce"] : 
        (data[self.database.currentKey]==='GRN') ? ["white","#298422"] :
        (data[self.database.currentKey]==='XEN') ? ["white","#e6711b"] : 
        (data[self.database.currentKey]==='ON') ? ["white","#cd34b5"] : 
        (data[self.database.currentKey]==='LP') ? ["white","#005689"] : 
        (data[self.database.currentKey]==='LNP') ? ["white","#005689"] : 
        (data[self.database.currentKey]==='CLP') ? ["white","#005689"] :
        (data[self.database.currentKey]==='KAP') ? ["white","#ff9b0b"] : 
        (data[self.database.currentKey]==='NP') ? ["white","#005689"] : ["white","darkgrey"] ;

        var scaleColour = d3.scaleLinear().domain([0, 80]).range(colours); 

        return scaleColour(data[`FP_${data[self.database.currentKey]}_Percentage`]) ; 

    }

    keygen() {

        var self = this

        var margin = {top: 10, right: 10, bottom: 10, left: 10};

        this.keyWidth = 320 - margin.left - margin.right;

        this.keyHeight = 70 - margin.top - margin.bottom;

        if (this.keyWidth > this.width - 10) {
            this.keyWidth = this.width - 10
        }

        d3.select("#keyContainer svg").remove();

        if (self.database.currentKey!="FP_PartyAb") {

            this.keySvg = d3.select("#keyContainer").append("svg")
                .attr("width", 320)
                .attr("height", `${70}px`)
                .attr("id", "keySvg")
            
            var legend = this.keySvg.append("defs")
              .append("svg:linearGradient")
              .attr("id", "gradient")
              .attr("x1", "0%")
              .attr("y1", "100%")
              .attr("x2", "100%")
              .attr("y2", "100%")
              .attr("spreadMethod", "pad");

            legend.append("stop")
              .attr("offset", "0%")
              .attr("stop-color", self.keyColors[0])
              .attr("stop-opacity", 1);

            legend.append("stop")
              .attr("offset", "100%")
              .attr("stop-color", self.keyColors[1])
              .attr("stop-opacity", 1);

            var g = this.keySvg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.append("rect")
              .attr("width", self.keyWidth)
              .attr("height", self.keyHeight - 30)
              .style("fill", "url(#gradient)")
              .attr("transform", "translate(0,10)");

            var y = d3.scaleLinear()
              .range([0, 300])
              .domain([0, 80]);

            var yAxis = d3.axisBottom()
              .scale(y)
              .ticks(5)
              .tickFormat((d) => (d+'%'));

            g.append("g")
              .attr("class", "y axis")
              .attr("transform", "translate(0,30)")
              .call(yAxis)
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 0)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("axis title");

        }
 
    }

    initMap() {

        var self = this

        this.map = L.map('map-voronoi', { 
            renderer: L.canvas(),
            scrollWheelZoom: false
        }).setView([-27, 133.772541], 4);

        var styled = L.gridLayer.googleMutant({

            type: 'roadmap',

            styles: mapstyles

        }).addTo(self.map);

        self.geojson = topojson.feature(self.boundaries, self.boundaries.objects.polling)

        function voronoiStylizer(d) {

            var colour = (d.properties[self.database.currentKey]!=null) ? self.color(d.properties) : 'lightgrey' ;

            var voronoiStyle = {
                "fillColor": `${colour}`,
                "color": `${colour}`,
                "weight": 1,
                "fillOpacity": 0.8,
                "opacity": 0.8
            };

            return voronoiStyle

        }      

        var utilities = {
            decimals: function(items) {
                var nums = items.split(",")
                return parseFloat(this[nums[0]]).toFixed(nums[1]);
            }
        }

        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };
        
        info.update = function (properties) {
            var html = (properties) ? self.toolbelt.mustache(self.database.mapping[self.database.currentIndex].tooltip, {...utilities, ...properties}) : "Polling stations" ;
            this._div.innerHTML = html
        };

        info.addTo(self.map);

        this.voronoiPolygons = L.geoJSON(self.geojson, {

          style: voronoiStylizer

        }).addTo(self.map);

        this.voronoiPolygons.on('mouseover', function(d) {

            info.update(d.layer.feature.properties);

        });

        this.updateBoundaries()

    }

    updateBoundaries() {

        var self = this

        var combined = this.database.data.map( (item) => item.DivName )

        var uniques = new Set(combined);

        var electorates = Array.from(uniques);

        var array = [];

        for (var i = 0; i < electorates.length; i++) {

            var electorate = self.database.data.filter( (item) => item.DivName === electorates[i])

            var array = electorate.map( (item) => item.id )

            var boundary = topojson.merge(self.boundaries, self.boundaries.objects.polling.geometries.filter(function(d) { 
                return (self.contains(array, d.properties.PPId))
            }))

            var bound = L.geoJSON(boundary, {

                style: {
                    "color": "black",
                    "weight": 1,
                    "fillOpacity": 0,
                    "dashArray": "5, 5", 
                    "dashOffset": 0,
                    "opacity": 1
                },
                interactive: false

            }).addTo(self.map);

            array.push(bound);

        }

        var polity = L.featureGroup(array).addTo(self.map);

    }

    contains(a, b) {

        if (Array.isArray(b)) {

            return b.some(x => a.indexOf(x) > -1);

        }

        return a.indexOf(b) > -1;
    }

    updateMap() {

        var self = this

        if (this.voronoiPolygons!=null) {

            this.voronoiPolygons.eachLayer(function (d) {  

                var colour = (d.feature.properties[self.database.currentKey]!=null) ? self.color(d.feature.properties) : 'lightgrey' ;  
                
                d.setStyle({fillColor : colour, color: colour }) 
        
            });

        }
    }

}
