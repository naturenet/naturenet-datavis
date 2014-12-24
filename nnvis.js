(function($) {

	$.fn.nnbarchart = function(options) {

		return this.each(function() {
			var $chartContainer = $(this);
			// UI elments
			var $chartDiv, $ySelect, $mSelect;

			// d3 elements
			var marign, height, width, x, y, xAxis, yAxis, svg;

			// data
			// converted JSON follows {"date": mm/dd/yy , "frequency" : nn}
			var contributions = [];

			// Establish our default settings
	        var typeOption = $.extend({
	            type : null
	        }, options);

	        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ setup UI & chart ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	       	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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
	        	$chartContainer.addClass("container");
	        	createSelectDiv();
	        	createChartDiv();
	        	setMargin();
	        	setXY();
	        	setSVG();
	        	initElement();
	        };

	        /* register listeners to year and month selectors */
	        var initElement = function() {
	        	$ySelect = $(".year", $chartContainer);	        	
	        	$mSelect = $(".month", $chartContainer);
	        	$ySelect.on("change", generateSVG);
	        	$mSelect.on("change", generateSVG);
	        };

	        // year/month select listener
	        var generateSVG = function(mData) {
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

 			/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ parse data ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	       	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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

			// generates the svg for the bar chart
			var renderSVG = function(data) {		
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
			      .attr("x", function(d) { return x(d.date); })
			      .attr("width", x.rangeBand())
			      .attr("y", function(d) { return y(d.frequency); })
			      .attr("height", function(d) { return height - y(d.frequency); });
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
					if ((year == yearFormat(date)) && (month == monthNameFormat(date))) {
						var index = dayFormat(date) * 10 / 10;
						defaultMontlyData[index].frequency = data[i].frequency;
					}
				}
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
							console.log(monthNameFormat(date));
							if (months[j] ==  monthNameFormat(date)) {
								yearlyData[j].frequency += data[i].frequency;
							}
						}
					}
				}
				console.log(yearlyData);
				return yearlyData;
			};

			/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ d3 starts ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	       	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
			// parse json and render svg starts here
			d3.json("http://naturenet-dev.herokuapp.com/api/notes", function(error, json) {
			    if (error) return console.warn(error);
				data = json['data'];
				// var ideas = getListOfNotes(data, typeOption.type);
				var notes = getListOfNotes(data, typeOption.type);
				// run setupVis by calling this method
	        	setupVis();
	        	// renderSVG(notes);
			 });
		});
	};

})(jQuery);