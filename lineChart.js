
// Set up margins, width, and height for the charts
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Set the color scale for different categories
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Create the main chart container
const svg = d3.select("#charts").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the CSV file
d3.csv("data.csv").then(function(data) {
    // Parse the date values and numbers
    data.forEach(function(d) {
        d.date = d3.timeParse("%Y-%m-%d")(d.date);
        d.value = +d.value;
    });

    // Group data by category
    const categories = d3.nest()
        .key(function(d) { return d.category; })
        .entries(data);

    // Set the x and y scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.value; })])
        .range([height, 0]);

    // Add the X axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(d3.timeDay.every(1)));

    // Add the Y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    // Create a line generator function
    const line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.value); });

    // For each category, create a line chart
    categories.forEach(function(category, index) {
        svg.append("path")
            .data([category.values])
            .attr("class", "line")
            .attr("d", line)
            .style("stroke", colorScale(index));

        // Add a label for each category
        svg.append("text")
            .attr("x", width - 10)
            .attr("y", yScale(d3.mean(category.values, d => d.value)))
            .attr("dy", ".35em")
            .style("fill", colorScale(index))
            .style("text-anchor", "end")
            .text(category.key);
    });

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Line Chart for Each Category");

}).catch(function(error) {
    console.error("Error loading the CSV file:", error);
});
