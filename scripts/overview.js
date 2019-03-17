
// create our SVG canvas and give it the height and width we want
var svgOV = d3.select('#overview').append('svg')
    .attr('width', window.innerWidth-margin.right)
    .attr('height', window.innerHeight/12 + 5) //space before next box
    .attr('text-anchor', 'middle')
    .style("font", "10px sans-serif");

var heightOV = window.innerHeight/12; //space to actually work in
var widthOV = window.innerWidth - margin.right;

var OV = svgOV.append('g')
           .attr('transform', 'translate(0,0)');
var xOV;
var yOV;
var brushOV;
var zoomOV;
var areaOV;
var profileOV;
var streamOV;

OV.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', heightOV)
    .attr('width', widthOV)
    .attr('fill', '#efefef')
    .attr('fill-opacity', 0.3);
//drawMP();
async function drawOV() {
    console.log('drawOV first line');
    var dataOV = await volume();
    const dates = dataOV.dates;
    const counts = dataOV.count;
    
    var volumeOV = [];
    for (i = 0; i < dates.length; i++) {
        volumeOV.push({date: dates[i], count: counts[i]});
    }
    
    xOV = d3.scaleTime()
        .domain(d3.extent(volumeOV, function(d) { return d.date; }))
        .range([0, widthOV]);
    
    yOV = d3.scaleLinear()
        .domain(d3.extent(counts))
        .range([heightOV, 0]);
    
    areaOV = d3.area()
        .curve(d3.curveMonotoneX)
        //.curve(d3.curveMonotoneX)
        .x(d=>xOV(d.date))
        .y0(yOV(0))
        .y1(d=>yOV(d.count));
    drawMP(dataOV);
    //drawMenu(dataOV);
    console.log('before profileOV');
    profileOV = OV.append('path')
        .datum(volumeOV)
        .attr('class', 'profileOV')
        .attr('fill', '#585858')
        .attr('fill-opacity', 0.8)
        .attr('d', areaOV);
    
    var xAxisOV = d3.axisBottom(xOV)
        //.attr('transform', 'translate(0, ' + (heightOV-5)+ ')')
        ;
    
    brushOV = d3.brushX()
        .extent([[0, 0], [widthOV, heightOV]])
        .on('brush end', brushedOV);
    console.log('d3.zoom');
    zoomOV = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [widthOV, heightOV]])
        .extent([[0, 0], [widthOV, heightOV]])
        .on('zoom', zoomedOV);

    OV.append('g').call(xAxisOV);
    console.log('done here');
    console.log(xMP.range());
    OV.append('g')
        .attr('class', 'brushOV')
        .call(brushOV)
        .call(brushOV.move, xMP.range());
    console.log('done drawOV');
    
    svgOV.append('defs').append('clipPath')
        .attr('id', 'clipOV')
        .append('rect')
            //.attr('fill', '#efefef')
            //.attr('fill-opacity', 0.4)
            //.attr('cursor', 'pointer')
            .attr('width', widthOV)
            .attr('height', heightOV);
    console.log('done drawOV');
    //svgMP.append('rect')
    //    .attr('class', 'zoomOV')
    //    .attr('fill', '#efefef')
    //    .attr('fill-opacity', 0.5)
    //    .attr('width', widthMP)
    //    .attr('height', heightMP)
    //    .attr('transform', 'translate(0, 0)')
    //    .call(zoomOV);
    console.log('last done drawOV');
} 
drawOV();

function brushedOV() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
    var s = d3.event.selection || xOV.range();
    if (bub) {
        bub.selectAll('g').remove();
        bub.selectAll('circle').remove();
    }
    //console.log(xMP.domain());
    xMP.domain(s.map(xOV.invert, xOV));
    //console.log(xMP.domain());
    //areaMP = d3.area()
    //    .curve(d3.curveBasis)
    //    .x(d=>xMP(d.date))
    //    .y0(yMP(0))
    //    .y1(d=>yMP(d.count));
    MP.select('.profileMP').attr('d', areaMP);
    MP.select('.xAxisMP').call(xAxisMP);
    MP.selectAll('.streamSP').attr('d', areaSP);
    MP.selectAll('.domValPlot').attr('transform', d=>'translate(' + xMP(d.date) + ',' + ySP(d.val) + ')');
    //console.log('brush xMP.domain()');
    //console.log(xMP.domain());
    //console.log('brush xOV.domain()');
    //console.log(xOV.domain());
    
    
    //svgMP.select('.zoomOV').call(zoomOV.transform, d3.zoomIdentity
    //    .scale(widthOV / (s[1] - s[0]))
    //    .translate(-s[0], 0));
}

function zoomedOV() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;

    var t = d3.event.transform;

    xMP.domain(t.rescaleX(xOV).domain());
    console.log('zoom xMP.domain()');
    console.log(xMP.domain());
    console.log('zoom xOV.domain()');
    console.log(xOV.domain());
    profileMP.select('.profileMP').attr('d', areaMP);

    profileOV.select('.brushOV').call(brushOV.move, xMP.range().map(t.invertX, t));
}


