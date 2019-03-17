var svgDV = d3.select('#detailView').append('svg')
    .attr('width', window.innerWidth - margin.right)
    .attr('height', window.innerHeight/2.5)
    .attr('text-anchor', 'start')
    .attr('font', '10px sans-serif');

var heightDV = window.innerHeight/2.5 - margin.bottom;

//for the tf-idf word lists FIXME hey Vaish
var widthTF = window.innerWidth/3 - 10;

//for raw tweet texts FIXME kathleen's
var widthRT = window.innerWidth * (2/3) - 10;

//Vaish's group for triggers
var TF = svgDV.append('g')
    .attr('transform', 'translate(0, 0)');

TF.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', heightDV)
    .attr('width', widthTF)
    .attr('fill', '#efefef')
    .attr('fill-opacity', 0.3);

var RT = svgDV.append('g')
    .attr('transform', 'translate(' + (widthTF + 10) + ', 0)');

RT.append('line')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', heightDV)
    .attr('stroke', 'black')
    .attr('stroke-width', 1);

RT.append('rect')
    .attr('x', 10)
    .attr('y', 0)
    .attr('height', heightDV)
    .attr('width', widthRT)
    .attr('fill', '#efefef')
    .attr('fill-opacity', 0.3);

