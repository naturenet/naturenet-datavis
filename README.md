NatureNet-DataVis
=================

NatureNet data visualization

nnvis.js contains two jQuery plugins. First, "dataParser" is used to parse data from NN APIs. Second, "nnbarchart" is used to draw a bar chart.

A demo of how to use nnvis.js can be found here: http://webpages.uncc.edu/~jxia3/nnvis/. The demo uses fontawesome and Bootstrap for the UI design.

Here is how to use the nnvis.js:

Step 1: Files to include
```HTML
    /* css */
    <link rel="stylesheet" href="./nnvis.css">
    /* js */
    <script src="http://d3js.org/d3.v3.min.js"></script>
    <script type="text/javascript" src="./nnvis.js"></script>
```
Step 2: HTML markup structure
```HTML
    <div class="chart_container text-center"></div>
```    
Step 3: Get data first, then display the data 
```Javascript
    var $chart_container = $(".chart_container");
    // get data first, dataParser is the first jQuery plugin
    var $this = $(this);
    var datapaser = $this.dataParser({
						url: "http://naturenet.herokuapp.com/api/notes"
					});
		
    // wait until dataparser is ready
    datapaser.on("dataReady", function() {
    	//get data from designIdeas
		var designIdeas = this.getDesignIdeas();
		// get data from observations
		var observations = this.getObservations();
		// create chart of design ideas by calling "nnbarchart" plugin
      	$chart_container.nnbarchart({
			data: designIdeas,
			type: "DesignIdea"
		});
		// similarily, create chart of observations by calling "nnbarchart" plugin
      	$chart_container.nnbarchart({
		  	data: observations,
		  	type: "FieldNote"
		});
	});
  
```
