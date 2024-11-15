
const width = 800, height = 800, margin = 120;
const categories = ['Computed Tomography scanners, total',
                    'Gamma cameras, total',
                    'Mammographs, total',
                    'Positron Emission Tomography (PET) scanners, total',
                    'Radiation therapy equipment, total']; 

const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("position", "absolute")
                    .style("visibility", "hidden")
                    .style("background-color", "rgba(0, 0, 0, 0.7)")
                    .style("color", "#fff")
                    .style("padding", "5px")
                    .style("border-radius", "3px")
                    .style("font-size", "12px");


function drawRadarChart(data) {
    const svg = d3.select("#chart").html("").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    
                    .attr("transform", `translate(${width / 2}, ${height / 2})`);

            
    const angleSlice = Math.PI * 2 / categories.length;
    const radius = Math.min(width, height) / 2 - margin;

  
    const scale = d3.scaleLinear().domain([0, 70]).range([0, radius]);

    const axisGrid = svg.append("g").attr("class", "axis-grid");
    const numLevels = 7;  
    const levelRadius = d3.range(1, numLevels + 1).map(d => scale(d * 10));
    axisGrid.selectAll(".grid-circle")
            .data(levelRadius)
            .enter()
            .append("circle")
            .attr("class", "grid-circle")
            .attr("r", d => d)
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .style("stroke-dasharray", "3, 3");
    axisGrid.selectAll(".axis")
            .data(categories)
            .enter()
            .append("line")
            .attr("class", "axis")
            .attr("x1", (d, i) => scale(70) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y1", (d, i) => scale(70) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("x2", 0)
            .attr("y2", 0)
            .style("stroke", "#ccc")
            .style("stroke-width", 1);

    axisGrid.selectAll(".axis-label")
            .data(categories)
            .enter()
            .append("text")
            .attr("class", "axis-label")
            .attr("x", (d, i) => (scale(70) + 10) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => (scale(70) + 10) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .text(d => d);

    const radarLine = d3.lineRadial()
                        .radius(d => scale(d))
                        .angle((d, i) => i * angleSlice);

    const radarPath = svg.append("path")
                    .datum(data)
                    .attr("d", radarLine)
                    .attr("fill", "rgba(0, 0, 255, 0.3)")
                    radarPath.on("mouseover", function() {
                            d3.select(this).transition().duration(200)
                              .attr("fill", "rgba(0, 0, 255, 0.5)")  
                                
                    })
                                .on("mouseout", function() {
                                    d3.select(this).transition().duration(200)
                                        .attr("fill", "rgba(0, 0, 255, 0.3)")  
                                        
                                });   

    const points = svg.selectAll(".radar-point")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("class", "radar-point")
                        .attr("cx", (d, i) => scale(d) * Math.cos(angleSlice * i - Math.PI / 2))
                        .attr("cy", (d, i) => scale(d) * Math.sin(angleSlice * i - Math.PI / 2))
                        .attr("r", 4)
                        .attr("fill", "red")
                        .attr("stroke", "white")
                        .attr("stroke-width", 1)
                        .on("mouseover", function(event, d) {
                            tooltip.style("visibility", "visible")
                                .text(`Value: ${d}`); 

                            d3.select(this).transition().duration(200)
                                .attr("r",8) 
                                .style("fill", "yellow") 
                                .style("filter", "url(#glow)"); 
                        })
                        .on("mousemove", function(event) {
                            tooltip.style("top", (event.pageY + 5) + "px")
                                .style("left", (event.pageX + 5) + "px");
                        })
                        .on("mouseout", function() {
                            tooltip.style("visibility", "hidden"); 
                            d3.select(this).transition().duration(200)
                                .attr("r", 4) 
                                .style("fill", "red") 
                                .style("filter", "none"); 
                        });
                        
        
}

d3.csv('Clean Processing/Medical_TechnologyFix.csv').then(data => {
    const yearsData = d3.groups(data, d => d.TIME_PERIOD); 

    const radarData = {};
    
    yearsData.forEach(([year, records]) => {
        radarData[year] = categories.map(category => {
            const record = records.find(d => d.Variable === category);
            return record ? +record.OBS_VALUE : 0; 

        });
    });

    drawRadarChart(radarData['2010']);
    d3.selectAll("#button-container button").on("click", function(event) {
        const selectedYear = this.getAttribute('data-year');
        drawRadarChart(radarData[selectedYear]);
    });
});





