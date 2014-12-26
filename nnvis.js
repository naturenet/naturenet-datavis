(function($) {

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ nnbarchart plugin~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/**
     * @example
     * $('#element').nnbarchart({
     *     data: 'this is the data will be displayed',
     *     type: 'DesignIdeas, NoteFields'
     * });
     */
	$.fn.nnbarchart = function(options) {

		return this.each(function() {
			var $chartContainer = $(this);
			// UI elments
			var $chartDiv, $ySelect, $mSelect, $header;

			// d3 elements
			var marign, height, width, x, y, xAxis, yAxis, svg;

			// Establish our default settings
	        var typeOption = $.extend({
	        	data : null,
	            type : null
	        }, options);

	        // data
			// converted JSON follows {"date": mm/dd/yy , "frequency" : nn}
			var contributions = typeOption.data;

	        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setup UI & chart ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	       	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	       	var createHeader = function() {
	       		$header = $(document.createElement("h2")).addClass("text-center");
	       		if (typeOption.type == "DesignIdea") {
	       			$header.html("Design Ideas");
	       		} else if (typeOption.type == "FieldNote") {
	       			$header.html("Observations");
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
	        	$chartDiv = $(document.createElement("div")).addClass("chart");
	        	$chartDiv.appendTo($chartContainer);
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

	        var setSVG = function() {
	        	svg = d3.select(".chart").append("svg")
			    		.attr("width", width + margin.left + margin.right)
			    		.attr("height", height + margin.top + margin.bottom)
			  			.append("g")
			    		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	        };


	        // everything starts from here
	        var setupVis = function() {
	        	createHeader();
	        	createSelectDiv();
	        	createChartDiv();
	        	setMargin();
	        	setXY();
	        	setSVG();
	        	initElement();
	        };

	        /* register listeners to year and month selectors */
	        var initElement = function() {
	        	$header = $("h2", $chartContainer);
	        	$ySelect = $(".year", $chartContainer);	        	
	        	$mSelect = $(".month", $chartContainer);
	        	$ySelect.on("change", generateSVG);
	        	$mSelect.on("change", generateSVG);
	        };

	        // year/month select listener
	        var generateSVG = function() {
	        	var year = $ySelect.val();
	        	var month = $mSelect.val();
	        	console.log("year seleciton: " + year + " month: " + month);
	        	var mData;
	        	(month == 0) ? mData = getYearlyData(contributions, year) 
	        				: mData = getMonthlyData(contributions, year, month);
				d3.select("svg").remove();
	        	setMargin();
	        	setXY();
	        	setSVG();
			    renderSVG(mData);
	        };

			// generates the svg for the bar chart
			var renderSVG = function(data) {	
				var tip = d3.tip()
				  		.attr('class', 'd3-tip')
				  		.offset([-10, 0])
				  		.html(function(d) {
				    		return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
				  		});	
				svg.call(tip);

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
			      	.attr("height", function(d) { return height - y(d.frequency); });
			      	// .on("mouseover", tip.show)
			      	// .on("mouseout", tip.hide);
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
						defaultMontlyData[index].frequency = data[i].frequency;
					}
				}
				console.log("mothly data is: ");
				console.log(defaultMontlyData);
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
								yearlyData[j].frequency += data[i].frequency;
							}
						}
					}
				}
				console.log("yearly data is: "); 
				console.log(yearlyData);
				return yearlyData;
			};
			// run setupVis by calling this method
	        setupVis();
	        generateSVG();
		});  // <--- this.each() return function ends
			
  	};  // <--- nnbarchart ends


	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ data parser ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/**
	 * @example
     * $('#element').dataParser({
     *    url: 'NN data api url'
     * });
     */
  	$.fn.dataParser = function(options) {
  		// Establish our default settings
        var settings = $.extend({
        	url : null
        }, options);

       	return this.each(function()  {
       		var $this = $(this);
       		var designIdeas = [];
       		var observations = [];

       		// get list of notes from data	
			var getListOfNotes = function(data, type) {
			    var times = [];
			    for (var i in data) {
			      	if (data[i]['kind'] == type) {
			        	times.push(data[i]['modified_at']);
			      	}
			    }
			    times.sort(function (a, b) {
			      	return a-b;
			    });

			    var convertedTimes = [];
			    for (var j = 0; j < times.length; j++) {
			      convertedTimes.push(convertDate(times[j])); 
			      // console.log(times[j] + "--" + convertedTimes[j]);
			    }
			    var lastSame = 0;
			    var contributions = [];
			    for (var m = lastSame+1; m < convertedTimes.length; m++) {
			      if (convertedTimes[m] != convertedTimes[m-1]) {
			          var contribution = {"date" : convertedTimes[m-1] , "frequency" : m - lastSame};
			          contributions.push(contribution);
			          lastSame = m; 
			      }
			    }
			    console.log(contributions);
			    return contributions;
			};

			// convert epoch time to mm/dd/yy
			var convertDate = function(date) {
			  var cDate = new Date(date);
			  var format = d3.time.format("%m/%d/%y");
			  return format(cDate);
			};

			// convert epoch time to mm dd
			var mmddDate = function(date) {
			  var cDate = new Date(date);
			  var format = d3.time.format("%b %d");
			  return format(cDate);
			};

			// parse json and render svg starts here
			d3.json(settings.url, function(error, json) {
			    if (error) return console.warn(error);
				var data = json['data'];
				designIdeas = getListOfNotes(data, "DesignIdea");
				observations = getListOfNotes(data, "FieldNote");
				$this.trigger("dataReady");	
			}); 

			this.getDesignIdeas = function() {
				return designIdeas;
			};

			this.getObservations = function() {
				return observations;
			};

       	}); // <--- this.each ends
        
  	}; // <--- dataPaser ends

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ linechart plugin~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	// not available now
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
		      .orient("bottom");

		var yAxis = d3.svg.axis()
		      .scale(lineY)
		      .orient("left");

		var line = d3.svg.line()
		      .x(function(d) { return lineX(d.date); })
		      .y(function(d) { return lineY(d.close); });

		var svg = d3.select("#note_chart").append("svg")
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
	  	})
  	}; // <---line chart ends
})(jQuery);

