(function($) {

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ nnbarchart plugin~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/**
     * @example
     * $('#element').barchart({
     *     url: 'data api link url',
     *     type: 'DesignIdeas, NoteFields, Comments, etc..'
     * });
     */
	$.fn.nnchart = function(options) {

		return this.each(function() {
			var $chartContainer = $(this);
			// UI elments
			var $barChartDiv, $lineChartDiv, $loadingDiv, $ySelect, $mSelect, $header;

			// d3 elements
			var marign, height, width, x, y, xAxis, yAxis, svg;

			// Establish our default settings
	        var defaultOptions = $.extend({
	        	url : null,
	            type : null
	        }, options);

	        // data
			// converted JSON follows {"date": mm/dd/yy , "frequency" : nn}
			var contributions;
	        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setup UI & chart ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	       	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	       	var createHeader = function() {
	       		$header = $(document.createElement("h2")).addClass("text-center");
	       		if (defaultOptions.type == "DesignIdea") {
	       			$header.html("Design Ideas");
	       		} else if (defaultOptions.type == "FieldNote") {
	       			$header.html("Observations");
	       		} else if (defaultOptions.type == "Users") {
	       			$header.html("Users");
	       		} else if (defaultOptions.type == "Comments") {
	       			$header.html("Comments");
	       		} else if (defaultOptions.type == "Likes") {
	       			$header.html("Likes");
	       		}

	       		$header.appendTo($chartContainer);
	       	};

	       	// create loading overlay
	       	var createLoading = function() {
                var $loadingDiv = $(document.createElement("div")).addClass("loading");
                var $loadingIcon = $(document.createElement("div")).addClass("loading_icon");
                var $loadingSpan = $(document.createElement("span")).addClass("glyphicon glyphicon-refresh");
                $loadingIcon.append($loadingSpan);
                var $loadingP = $(document.createElement("p")).text("loading");
                $loadingIcon.append($loadingP);
                $loadingDiv.append($chartContainer);
	       	};

	        var createSelectDiv = function() {
      			var years = [2014, 2015];
      			var months = ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      							"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      			var $filterDiv = $(document.createElement("div")).addClass("filter text-center");
      			var $yearSelect = $(document.createElement("select")).addClass("form-control reset year");
      			for (i in years) {
      				var $yearSelectOption = $(document.createElement("option")).html(years[i]);
      				$yearSelectOption.appendTo($yearSelect);
      			}
      			var $monthSelect = $(document.createElement("select")).addClass("form-control reset month");
      			for (j in months) {
      				var $mSelectOption = $(document.createElement("option")).html(months[j]).attr("value", j);
      				$mSelectOption.appendTo($monthSelect);
      			}
      			$yearSelect.appendTo($filterDiv);
      			$monthSelect.appendTo($filterDiv);
      			$filterDiv.appendTo($chartContainer);
	        };

	        var createChartDiv = function() {
	        	$barChartDiv = $(document.createElement("div")).addClass("barchart");
	        	$lineChartDiv = $(document.createElement("div")).addClass("linechart");
	        	$barChartDiv.appendTo($chartContainer);
	        	$lineChartDiv.appendTo($chartContainer);
	        };

	        // create loading overlay
          	var createLoading = function() {
          		$loadingDiv = $(document.createElement("div")).addClass("loading");
          		var $loadingIcon = $(document.createElement("i")).addClass("fa fa-spinner fa-spin fa-5x");
          		var $loadingP = $(document.createElement("h5")).text("Loading...");
          		$loadingDiv.append($loadingIcon);
          		$loadingDiv.append($loadingP);
          		$loadingDiv.appendTo($chartContainer);
        	};

        	// remove loading div
        	var removeLoading = function() {
        		if ($loadingDiv != null) {
	              	$loadingDiv.remove();
	            }
        	};

	        var setMargin = function() {
				margin = {top: 20, right: 20, bottom: 30, left: 40},
			    width = 1000 - margin.left - margin.right,
			    height = 500 - margin.top - margin.bottom;
	        };

	        var setXY = function() {
				x = d3.scale.ordinal()
				    .rangeRoundBands([0, width], .1);

				y = d3.scale.linear()
				    .range([height, 0]);

				xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom");

				yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left")
				    .ticks(5);	
	        };

	        var initSVG = function(element) {
	        	svg = d3.select(element).append("svg")
			    		.attr("width", width + margin.left + margin.right)
			    		.attr("height", height + margin.top + margin.bottom)
			  			.append("g")
			    		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			   	return svg;
	        };

	        /* register listeners to year and month selectors */
	        var initElement = function() {
	        	$header = $("h2", $chartContainer);
	        	$lineChartDiv = $(".linechart", $chartContainer);
	        	$ySelect = $(".year", $chartContainer);	        	
	        	$mSelect = $(".month", $chartContainer);
	        	$ySelect.on("change", generateSVG);
	        	$mSelect.on("change", generateSVG);
	        };

			// generates the svg for the bar chart
			var renderSVG = function(data, svg, type) {	
			  	x.domain(data.map(function(d) { return d.date; }));
			  	y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

			  	svg.append("g")	
			      	.attr("class", "x axis")
			      	.attr("transform", "translate(0," + height + ")")
			      	.call(xAxis);

			  	svg.append("g")
			      	.attr("class", "y axis")
			      	.call(yAxis)
			    	.append("text")
			      	.attr("transform", "rotate(-90)")
			      	.attr("y", 6)
			      	.attr("dy", ".71em")
			      	.style("text-anchor", "end")
			      	.text("Frequency");

			    if (type == "bar") {
			    	svg.selectAll(".bar")
			      		.data(data)
			      		.enter().append("rect")
			      		.attr("class", "bar")
			      		.attr("data-toggle", "tooltip")
			      		.attr("x", function(d) { return x(d.date); })
			      		.attr("width", x.rangeBand())
			      		.transition()
			      		.delay(function (d, i) { 
				      		if (d.frequency == 0) return 0 
				      		else return i*50  })
				      	// .duration(50)
				      	.attr("y", function(d) { return y(d.frequency); })
				      	.attr("height", function(d) { return height - y(d.frequency); })
				      	.text(function(d) { return d.frequency; });
			    } else if (type == "line") {
			    	var line = d3.svg.line()
							      .x(function(d) { return x(d.date); })
							      .y(function(d) { return y(d.frequency); });
			    	svg.append("path")
			        .datum(data)
			        .attr("class", "line")
			        .attr("d", line);
			    }

			};

			// filter data by month (yyyy/mm)
			var getMonthlyData = function(data, year, month) {
				var defaultMontlyData = [];
				var days = new Date(year, month, 0).getDate();
				for (var i = 1; i <= days; i++ ) {
					var dailyDataDefault = {"date": i ,"frequency" : 0 };
					defaultMontlyData.push(dailyDataDefault);
				}

				for (var i in data) {
					var date = new Date(data[i].date);
					var monthNameFormat = d3.time.format("%m"); // get month mm
					var yearFormat = d3.time.format("%Y");  // get year yyyy
					var dayFormat = d3.time.format("%d");  // get day dd
					var monthIndex = monthNameFormat(date) * 10 / 10;
					if ((year == yearFormat(date)) && (month == monthIndex)) {
						var index = dayFormat(date) * 10 / 10;
						// adding paserInt is to force the frequecy is a number
						defaultMontlyData[index].frequency = parseInt(data[i].frequency);
					}
				}
				// console.log("mothly data is: ");
				// console.log(defaultMontlyData);
				return defaultMontlyData;
			};

			// filetr data by year(yyyy)
			var getYearlyData = function (data, year) {
				var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      							"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      			var yearlyData = [];
      			for (var i = 0; i < months.length; i++) {
      				var monthlyDataDefault = {"date": months[i] ,"frequency" : 0 };
					yearlyData.push(monthlyDataDefault);
      			}
      			for (var i in data) {
					var date = new Date(data[i].date);
					var monthNameFormat = d3.time.format("%b"); // get month mm
					var yearFormat = d3.time.format("%Y");  // get year yyyy
					if ((year == yearFormat(date))) {
						for (var j = 0; j < months.length; j++) {
							// console.log(monthNameFormat(date));
							if (months[j] ==  monthNameFormat(date)) {
								// adding paserInt is to force the frequecy is a number
								yearlyData[j].frequency += parseInt(data[i].frequency);
							}
						}
					}
				}
				// console.log("yearly data is: "); 
				// console.log(yearlyData);
				return yearlyData;
			};

	        // every HTML element initialize from here
	        var setupVis = function() {
	        	createHeader();
	        	createSelectDiv();
	        	createChartDiv();
	        	createLoading();
	        };

	        // year/month select listener
	        var generateSVG = function() {
	        	setMargin();
	        	setXY();
	        	initElement();
	        	var year = $ySelect.val();
	        	var month = $mSelect.val();
	        	// console.log("year seleciton: " + year + " month: " + month);
	        	var mData;
	        	(month == 0) ? mData = getYearlyData(contributions, year) 
	        				: mData = getMonthlyData(contributions, year, month);
				// d3.select("svg").remove();
				$barChartDiv.empty();
				$lineChartDiv.empty();
	        	setMargin();
	        	setXY();
	        	var barsvg = initSVG(".barchart");
	        	var linesvg = initSVG(".linechart");
			    renderSVG(mData, barsvg, "bar");
			    renderSVG(mData, linesvg, "line");
	        };

	        // show data to the chart
	        var showChartByData = function() {
	        	var url = defaultOptions.url;
	        	setupVis();
	          	d3.tsv(url, toNumber, function(error, data) {
	            	removeLoading();
	            	contributions = data;
	            	generateSVG();
	          	});

		        var toNumber = function (d) {
		        	d.value = +d.value; // coerce to number
		            return d;
		        }
		    };

			showChartByData();

		});  // <--- this.each() return function ends
			
  	};  // <--- nnchart ends

	// !!!!  not available now !!!!!
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ linechart plugin~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
  	$.fn.nnlinechart = function () {
  		var margin = {top: 20, right: 20, bottom: 30, left: 50},
		    width = 960 - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;
		var parseDate = d3.time.format("%d-%b-%y").parse;

		var lineX = d3.time.scale()
		      .range([0, width]);

		var lineY = d3.scale.linear()
		      .range([height, 0]);

		var xAxis = d3.svg.axis()
		      .scale(lineX)
		      .orient("bottom")
			  .ticks(d3.time.days)
		    // .tickSize(16, 0)
		    .tickFormat(d3.time.format("%d"));

		var yAxis = d3.svg.axis()
		      .scale(lineY)
		      .orient("left");

		var line = d3.svg.line()
		      .x(function(d) { return lineX(d.date); })
		      .y(function(d) { return lineY(d.close); });

		var svg = d3.select("#linechart").append("svg")
		      .attr("width", width + margin.left + margin.right)
		      .attr("height", height + margin.top + margin.bottom)
		    .append("g")
		      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		d3.tsv("data.tsv", function(error, data) {
			    data.forEach(function(d) {
			    d.date = parseDate(d.date);
			    d.close = +d.close;
			});

			lineX.domain(d3.extent(data, function(d) { return d.date; }));
			lineY.domain(d3.extent(data, function(d) { return d.close; }));

			svg.append("g")
		        .attr("class", "x axis")
		        .attr("transform", "translate(0," + height + ")")
		        .call(xAxis);

		    svg.append("g")
		        .attr("class", "y axis")
		        .call(yAxis)
		      .append("text")
		        .attr("transform", "rotate(-90)")
		        .attr("y", 6)
		        .attr("dy", ".71em")
		        .style("text-anchor", "end")
		        .text("Price ($)");

		    svg.append("path")
		        .datum(data)
		        .attr("class", "line")
		        .attr("d", line);
	  	});
  	}; // <---line chart ends
})(jQuery);

