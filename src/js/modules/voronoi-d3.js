import { Toolbelt } from '../modules/toolbelt'
import template from '../../templates/template.html'
import * as d3 from "d3"
import * as topojson from "topojson"
// Comment out ractive before deploying
import Ractive from 'ractive'
import GoogleMapsLoader from 'google-maps';
import mapstyles from '../modules/mapstyles.json'
import L from 'leaflet'
import '../modules/Leaflet.GoogleMutant.js'
//import '../modules/Leaflet.Topojson.js'

export class Voronoi {

	constructor(data, boundaries, id) {

        var self = this

        this.database = data

        this.boundaries = boundaries

        this.boundaryID = id

        this.database.currentIndex = 0

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


        /*
        Check to see if user is on a mobile.
        If the user is on a mobile lock the map by default
        */

        this.isMobile = self.toolbelt.mobileCheck()

        this.database.zoomOn = (self.isMobile) ? false : true ;

        this.isAndroidApp = (window.location.origin === "file://" && /(android)/i.test(navigator.userAgent) ) ? true : false ;  

        this.colourizer()

        this.keygen()

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

            self.database.currentKey = self.database.mapping[index].data

            self.colourizer()

            self.updateMap()

            self.keygen()

        });

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

            this.color = function(d) {

                return self.scalerizer(d)

            }

        } else {

            this.keyColors = self.database.mapping[self.database.currentIndex].colours.split(",");

            this.scaleColour = d3.scaleLinear().domain([0, 80]).range(self.keyColors); 

            this.color = function(d) {

                return self.scaleColour(d[self.database.currentKey]) ;               

            }

        }

    }

    scalerizer(data) {

        var self = this

        var colours = (data[self.database.currentKey]==='ALP') ? ["white","red"] : 
        (data[self.database.currentKey]==='GRN') ? ["white","green"] : 
        (data[self.database.currentKey]==='XEN') ? ["white","orange"] : 
        (data[self.database.currentKey]==='ON') ? ["white","purple"] : 
        (data[self.database.currentKey]==='LP') ? ["white","blue"] : 
        (data[self.database.currentKey]==='LNP') ? ["white","blue"] : 
        (data[self.database.currentKey]==='CLP') ? ["white","blue"] : 
        (data[self.database.currentKey]==='NP') ? ["white","blue"] : 
        ["white","grey"] ;

        var scaleColour = d3.scaleLinear().domain([0, 80]).range(colours); 

        return scaleColour(data[`FP_${data[self.database.currentKey]}_Percentage`]) ; 

    }

    keygen() {

        var self = this

        this.keyWidth = 290;

        if (this.keyWidth > this.width - 10) {
            this.keyWidth = this.width - 10
        }

        d3.select("#keyContainer svg").remove();

        if (self.database.currentKey!="FP_PartyAb") {

            this.keySvg = d3.select("#keyContainer").append("svg")
                .attr("width", self.keyWidth)
                .attr("height", "40px")
                .attr("id", "keySvg")
            
            this.keySquare = 30 //this.keyWidth / 10;

            const barHeight = 15
            const height = 30

            var value = [0, 20, 40, 60, 80];

            var label = ["0%", "20%", "40%", "60%", "80%"];   

            this.keyWidth = document.querySelector("#keyContainer").getBoundingClientRect().width - 10

            this.keySquare = this.keyWidth / 6;

            value.forEach(function(d, i) {

                self.keySvg.append("rect")
                    .attr("x", self.keySquare * i)
                    .attr("y", 0)
                    .attr("width", self.keySquare)
                    .attr("height", barHeight)
                    .attr("fill", self.scaleColour(d))
                    .attr("stroke", "#dcdcdc")
            })

            label.forEach(function(d, i) {

                self.keySvg.append("text")
                    .attr("x", (i) * self.keySquare)
                    .attr("text-anchor", "start")
                    .attr("y", height)
                    .attr("class", "keyLabel").text(d)
            })

        }
 
    }

    initMap() {

        var self = this

        var map = L.map('map').setView([-27, 133.772541], 4);

        var styled = L.gridLayer.googleMutant({

            type: 'roadmap',

            styles: mapstyles

        }).addTo(map);

        var svgLayer = L.svg();

        svgLayer.addTo(map);

        var svg = d3.select("#map").select("svg").attr("id", "vectormap")

        var features = svg.append("g")

        var geojson = topojson.feature(self.boundaries, self.boundaries.objects.polling)

        var transform = d3.geoTransform({point: function(x, y) {
                            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
                            this.stream.point(point.x, point.y);
                        }})
    
        this.path = d3.geoPath().projection(transform);

        features.append("g").selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("class", self.database.topoKey + " mapArea")
            .attr("fill", (d) => (d.properties[self.database.currentKey]!=null) ? self.color(d.properties) : 'lightgrey' )
            .style("opacity", 0.7)
            .attr("d", self.path)
            .on("mouseover", tooltipIn)
            .on("mouseout", tooltipOut)

        var utilities = {

            decimals: function(items) {
                var nums = items.split(",")
                return parseFloat(this[nums[0]]).toFixed(nums[1]);
            }

        }

        function tooltipIn(d) {

            var html = (d.properties[self.database.currentKey]===0) ? "No party data for this polling station" : self.toolbelt.mustache(self.database.mapping[self.database.currentIndex].tooltip, {...utilities, ...d.properties}) ;
            console.log(html)
        }

        function tooltipOut(d) {
            //d3.select(".tooltip").style("visibility", "hidden");
        }

        function drawAndUpdateVoronoi() {

            var transform = d3.geoTransform({point: function(x, y) {
                                var point = map.latLngToLayerPoint(new L.LatLng(y, x));
                                this.stream.point(point.x, point.y);
                            }})
        
            self.path = d3.geoPath().projection(transform);

            self.updateMap()

        }

        function hideVoronoi() {

            d3.select("#vectormap").style("visibility", "hidden")

        }

        map.on("zoomstart", hideVoronoi);

        map.on("moveend", drawAndUpdateVoronoi);
        
    }

    updateMap() {

        var self = this

        d3.selectAll(`.${self.database.topoKey}`).transition("changeFill")
            .attr("fill", (d) => { return (d.properties[self.database.currentKey]!=null) ? self.color(d.properties) : 'lightgrey' })
            .attr("d", self.path)

        setTimeout(function(){ d3.select("#vectormap").style("visibility", "visible"); }, 750);

    }


}
