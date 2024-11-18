const width = 1000;
const height = 600;
const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
const margin = { top: 20, right: 200, bottom: 40, left: 80 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const chart = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xScale = d3.scaleLinear()
                .domain([2010, 2022]) 
                .range([0, innerWidth]);  

const yScale = d3.scaleLinear()
                .domain([0, 24000])  
                .range([innerHeight, 0]); 


const xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format(".0f")); 


const yAxis = d3.axisLeft(yScale)
                 .tickSize(-innerWidth);  


const colorScale = d3.scaleOrdinal()
                    .domain(["Computed Tomography scanners, total all", "Gamma cameras, total all", "Mammographs, total all","Positron Emission Tomography (PET) scanners, total all","Radiation therapy equipment, total all"])  // Define categories
                    .range([ "orange","steelblue", "purple","green","red"]);  

d3.csv("Clean Processing/Medical_Technology_Total.csv").then(data => {

    data.forEach(d => {
        d.x = +d.TIME_PERIOD;
        d.y = +d.OBS_VALUE;
        d.z = +d.Country
    });


    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis)
        .append("text")
        .attr("class", "axis-label")
        .attr("x", innerWidth / 2)
        .attr("y", 40)
        .style("text-anchor", "middle")
        .text("Year");


    chart.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "axis-label")
            .attr("x", -innerHeight / 2)
            .attr("y", -60)
            .style("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Amount");


    const dots = chart.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 5)  
            .style("fill", d => colorScale(d.Variable)) 
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 8);  


                tooltip.style("visibility", "visible")
                    .html(`Year: ${d.TIME_PERIOD}<br>Amount: ${d.OBS_VALUE}<br>Variable: ${d.Variable}`);
            })
            .on("mousemove", function(event, d) {
            
                tooltip.style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 5);  

            
                tooltip.style("visibility", "hidden");
            });


    const legend = svg.append("g")
            .attr("transform", `translate(${margin.left + innerWidth + 20}, ${margin.top})`);

    const categories = colorScale.domain();

 
    legend.selectAll(".legend")
            .data(categories)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend.selectAll(".legend")
            .append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", colorScale);

    legend.selectAll(".legend")
        .append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);

}).catch(error => {
    console.error("Error loading the CSV file:", error);
});


const tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("position", "absolute")
                    .style("background", "#fff")
                    .style("border", "1px solid #ddd")
                    .style("padding", "5px")
                    .style("border-radius", "3px")
                    .style("visibility", "hidden");
