define( ["jquery", "text!./DumbbellDotPlot.css", "./d3.min", "./axisAPI"], function ( $, cssContent ) {

	'use strict';


  	//append the syle sheet to the head
  	$("<style>").html(cssContent).appendTo("head");

	return {
		initialProperties: {
			version: 1.0,
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 3,
					qHeight: 1000
				}]
			}
		},
		//property panel
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					max: 1
				},
				measures: {
					uses: "measures",
					min: 2,
					max: 2
				},
				sorting: {
					uses: "sorting"
				},
				settings: {
					uses: "settings",
					items: {
						colorPanel: {
							type: "items",
							label: "Custom colors",
							items: {
								color1: {
									type: "string",
									label: "Bar Color",
									ref: "myproperties.color1",
									defaultValue: "black"
								},
								color2: {
									type: "string",
									label: "Measure 1 color",
									ref: "myproperties.color2",
									defaultValue: "black"
								},
								color3: {
									type: "string",
									label: "Measure 2 color",
									ref: "myproperties.color3",
									defaultValue: "grey"
								}
							}
						}
					}

				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},

		paint: function ( $element, layout ) {

			//data information variables
			var self = this,

				dimensions = layout.qHyperCube.qDimensionInfo,

                //data matrix
				matrix = layout.qHyperCube.qDataPages[0].qMatrix;
              //  console.log(matrix);
                console.log(layout);

          		//measure labels array
            var measureLabels = layout.qHyperCube.qMeasureInfo.map(function (d) {
                  return d.qFallbackTitle;
                });

          	//element information variables
          	var height = $element.height(),
                width = $element.width(),
                id = "container_" + layout.qInfo.qId;

			if (document.getElementById(id)) {
				// if it has been created, empty it's contents so we can redraw it
			 	$("#" + id).empty();
			}
			else {
				// if it hasn't been created, create it with the appropiate id and size
			 	$element.append($('<div />').attr("id", id).width(width).height(height));
			}

			viz(matrix, measureLabels, height, width, id, layout);
		}
	};

} );


var viz = function(data, labels, height, width, id, layout) {

	//set intial margins
  var margin = {top: 50, right: 20, bottom: 30, left: 20};

  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;


  //first create y scale in order to get correct margin space for dimension names
  var y = d3.scale.ordinal().rangeRoundBands([0, height], 0.05);
  var yAxis = d3.svg.axis().scale(y).orient('left');

  var svg = d3.select("#"+id).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    // add a group to that svg element for all of the subsequent visual elements.
	    // use this group to offset the positions of the sub-elements by the margins
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



  //map an array to get the values of the metric
  y.domain(data.map(function(d) { return d[0].qText; }));

	var yAxis_g = svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

	// Determine the width of the axis
	var yAxis_width = yAxis_g[0][0].getBoundingClientRect().width;

	// Remove the test yAxis
	yAxis_g.remove();

	// Update chart margin based on the yAxis width
	margin.left = margin.left + yAxis_width;

	// Create the chart height and width based on the new margin values
	height = height - margin.top - margin.bottom;
	width = width - margin.left - margin.right;

	// Move the svg group based on the new chart margins
	svg.attr("transform","translate(" + margin.left + "," + margin.top + ")");

	//create x scale/axis AFTER the chart margin has been adjusted for dimension name
	var x = d3.scale.linear().range([0, width]);
	var xAxis = d3.svg.axis().scale(x).orient('top');

  //array of max and mins from both measures, helps create the x domain
  var measures = layout.qHyperCube.qMeasureInfo;
  var minMaxArray = [measures[0].qMin, measures[1].qMin, measures[0].qMax, measures[1].qMax];

  //use the extent of minMaxArray for domain
  x.domain(d3.extent(minMaxArray));

  //append xAxis
  svg.append('g')
    .attr('class', 'x axis')
      .call(xAxis);


  //append yAxis
  svg.append('g')
    .attr('class', 'y axis')
      .call(yAxis)
    .append('text')
      .attr('class', 'label')
      .attr('y', -( margin.left - 10))
      .attr('x', -height/2)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'end')
      .text(layout.qHyperCube.qDimensionInfo[0].qFallbackTitle);



	//variable which holds the colorscheme properties
	var colors = layout.myproperties.colorscheme;

	//groupings for the visualiztion objects
	var dumbBell = svg.selectAll('.dumbBell').data(data).enter().append('g').attr('class', 'dumbBell');


	dumbBell.append('line')
		.attr('x1', function(d) { return x(d[1].qNum); })
		.attr('x2', function(d) { return x(d[2].qNum); })
		.attr('y1', function (d) { return y(d[0].qText); })
		.attr('y2', function (d) { return y(d[0].qText); })
		.attr('transform', 'translate(0, 10)')
		.attr('stroke', layout.myproperties.color1)
		.attr('stroke-width', 5);

	dumbBell.append('circle')
		.attr('r', 8)
		.attr('cx', function(d){ return x(d[1].qNum); })
		.attr('cy', function(d) { return y(d[0].qText); } )
		//translate circles down by 10 in order for tick to be in middle of circle
		.attr('transform', 'translate(0,10)')
		.attr('fill', layout.myproperties.color2);

	dumbBell.append('circle')
		.attr('r', 8)
		.attr('cx', function (d) { return x(d[2].qNum); })
		.attr('cy', function(d) { return y(d[0].qText); } )
		.attr('transform', 'translate(0,10)')
		.attr('fill', layout.myproperties.color3);

	//create and append the legend based on the measureInfo fallback titles
	var legend = svg.selectAll('.legend')
		.data(layout.qHyperCube.qMeasureInfo).enter()
			.append('g')
				.attr('class', 'legend')
				.attr('transform', 'translate(' + -(width/2 - 30) + ',-10)');

	legend.append('circle')
		.attr('cx', function(d, i) { return width - (i * 100); })
		.attr('cy', -20)
		.attr('r', 8)
		.attr('fill', function(d,i) {
			if(i === 1) return layout.myproperties.color3;
			else return layout.myproperties.color2;
		});

	legend.append('text')
		.attr('x', function(d, i) { return width - (i * 100); })
		.attr('y', -35)
		.attr('dy', '.35em')
		.style('text-anchor', 'middle')
		.text(function (d) { return d.qFallbackTitle; });


};
