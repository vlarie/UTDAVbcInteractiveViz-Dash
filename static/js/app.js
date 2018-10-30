function buildMetadata(sample) {
  // This function that builds the metadata panel 
  // using `d3.json` to fetch the metadata for a sample
  const url = `/metadata/${sample}`;

  // Fetch the JSON data and console log it
  d3.json(url).then(successHandle, errorHandle);
  
  function errorHandle(error) {
    console.log(error)
  };
  
  function successHandle(response) {
    // Select the panel with id of `#sample-metadata`
    // and clear existing metadata using `.html("")
    d3.select("#sample-metadata").html("")
    var metaData = d3.select("#sample-metadata")
    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(response).forEach(function([key, value]) {
      console.log(`Adding ${key}: ${value}`);
        metaData.classed("table-responsive", true)
        // Append table row with cell data
        // for each key, value pair 
        var row = metaData.append("tr");
        var cell1 = row.append("td");
        var cell2 = row.append("td");
        cell1.text(`${key}:`);
        cell2.text(`${value}`);
      });

    
    ///////////////  BONUS: Gauge Chart  ///////////////
    
    // Enter a speed between 0 and 180
    var washLevel = response.WFREQ;
    console.log(`Washing is ${washLevel}`)

        
    // Convert washLevel to appropriate gauge level
    var level = washLevel * 20;

    // Trig to calc meter point
    var degrees = 180 - level,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ 
      type: 'scatter',
      x: [0], 
      y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'scrubs per week',
      text: washLevel,
      hoverinfo: 'text+name'},
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1'],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:  
        ['rgba(30, 125, 0, .5)', 'rgba(75, 135, 15, .5)', 'rgba(110, 150, 30, .5)',
        'rgba(145, 170, 45, .5)', 'rgba(180, 195, 60, .5)', 'rgba(215, 225, 75, .5)',
        'rgba(230, 240, 100, .5)', 'rgba(240, 250, 150, .5)', 'rgba(250, 250, 200, .5)',
        'rgba(255, 255, 255, 0)']},  // white for bottom half of gauge
      labels: ['8-9 often', '7-8 daily', '6-7 most days', '5-6 semi-daily', '4-5 regularly', '3-4 every other day', '2-3 occasionally', '1-2 infrequently', '0-1 rarely', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        } 
      }],
      title: 'Scrubs per Week',
      height: 500,
      width: 500,
      xaxis: {
        zeroline:false, 
        showticklabels:false,
        showgrid: false, 
        range: [-1, 1]
      },
      yaxis: {
        zeroline:false, 
        showticklabels:false,
        showgrid: false, 
        range: [-1, 1]
      }
    };

    Plotly.newPlot('gauge', data, layout, {displayModeBar: false}, {responsive: true});


    };  // end of successHandle
 
  }
    
    
    
function buildCharts(sample) {
  
  const url = `/samples/${sample}`;

  // Fetch the JSON data and console log it
  d3.json(url).then(successHandle, errorHandle);
  
  function errorHandle(error) {
    console.log(error)
  };
  
  function successHandle(response) {
    // Object.entries(response).forEach()
    // @TODO console.log just prints 'object'
    console.log(`Data is: ${response}`);


    
  /////////////////  Bubble Chart  /////////////////

    // Use otu_ids for the x values
    var xVal = response.otu_ids
    // Use sample_values for the y values
    var yVal = response.sample_values
    // Use sample_values for the marker size
    var markSize = response.sample_values 
    // Use otu_ids for the marker colors
    var markColor = response.otu_ids
    // Use otu_labels for the text values
    var txtVal = response.otu_labels

    var trace1 = {
      x: xVal,
      y: yVal,
      text: txtVal,
      mode: 'markers',
      marker: {
        color: markColor, 
        size: markSize, 
        cmin: d3.min(markColor),
        cmax: d3.max(markColor),
        colorscale: 'Earth',
        line: {
            color: 'black'
        }
      }
    }
    
    
    var data = [trace1];
    
    var layout = {
      title: 'Belly Button Bacteria Breakdown',
      showlegend: false,
      height: 600,
      width: 1400
    };
    
    Plotly.newPlot('bubble', data, layout, {displayModeBar: false}, {responsive: true});

    
  /////////////////  Pie/Donut Chart  /////////////////
  ///////  (used donut for visual similarity  ////////
  /////////////  to belly buttons) :)  //////////////

    // Pie/Donut chart using data from (/samples/<sample>) to display the top 10 samples.

    // Linking dictionaries in a list to be ordered based on the top sample_values
    var dataLinked = [];
    for (var i = 0; i < response.sample_values.length; i++) {
      var dataDict = {
        sample_values: response.sample_values[i], 
        otu_ids: response.otu_ids[i], 
        otu_labels: response.otu_labels[i]};
      dataLinked.push(dataDict);
    };

    // Sort in descending order based on sample_values
    var sortedData = dataLinked.sort((first, second) => second.sample_values - first.sample_values);
    var topTen = sortedData.slice(0, 10);
    console.log(`The top ten samples are: ${topTen}`);

    // Function that takes in a list of dictionaries and returns values for a given key present in each dictionary
    // NOTE: key parameter must be passed as a string
    function valueColumn(dictList, key) {
      var newList = [];
      for (var i = 0; i < dictList.length; i++) {
        var values = dictList[i][key];
        newList.push(values);          
      }
      return newList;
    };

    // Use sample_values as the values for the pie chart
    var topVals = valueColumn(topTen, "sample_values");
    console.log(`Top Values: ${topVals}`);
  
    // Use otu_ids as the labels for the pie chart
    var topIDs = valueColumn(topTen, "otu_ids");
    console.log(`OTU IDs: ${topIDs}`);

    // Use otu_labels as the hovertext for the chart
    var topLabels = valueColumn(topTen, "otu_labels");
    console.log(`OTU Labels: ${topLabels}`);

    var earthTones = [
      '#83929F', '#4E6172', '#BDD09F', '#668D3C', '#404F24', 
      '#DBCA69', '#D57500', '#8F3B1B', '#855723', '#613318'
    ]

    var data = [{
      values: topVals,
      labels: topIDs, 
      text: 'Belly Button',
      textposition: 'inside',
      marker: {
        colors: earthTones
      },
      domain: {column: 0},
      hovertext: topLabels,
      hole: .4,
      type: 'pie'
    }];
    
    var layout = {
      title: 'Top Ten Bacteria Present',
      height: 500,
      width: 600,
      showlegend: true,
      grid: {rows: 1, columns: 1}
    };
    
    Plotly.newPlot('pie', data, layout, {displayModeBar: false}, {responsive: true});
  };
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
