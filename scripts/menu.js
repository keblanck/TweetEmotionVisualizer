//
//

var svgMenu = d3.select('#menu').append('svg')
    .attr('width', window.innerWidth - margin.right)
    .attr('height', 16)
    .attr('text-anchor', 'start')
    .style('font', '10px sans-serif');

var widthMenu = window.innerWidth - margin.right;
var heightMenu = 16;

var menu = svgMenu.append('g')
    .attr('transform', 'translate(0, 0)');


var buttons = [];


//function drawMenu(dataMP) {
//    const dates = dataMP.dates;
//    const counts = dataMP.count;
//    const tweets = dataMP.tweets;
//    const emotionsMP = dataMP.emotes;
//    const comp = dataMP.comp;
//
//    var buttonMenu = menu.selectAll('.actionMenu')
//        .data(dimension)
//        .enter().append('g')
//            .attr('class', 'actionMenu')
//            .attr('transform', function(d, i) { return 'translate(' + i*64 + ',0)'; })
//            .attr('cursor', 'pointer')
//            .on('click', (d, i) => makeStream(emotionsMP, dates, comp, 1, i))
//            ;
//            //.attr('x', (d, i)=>i*84)
//            //.attr('y', 0)
//    buttonMenu.append('rect')
//            .attr('x', 0)
//            .attr('y', 0)
//            .attr('class', 'actionMenu')
//            .attr('height', 12)
//            .attr('width', 60)
//            .attr('fill', '#efefef')
//            .attr('fill-opacity', 0.8);
//    buttonMenu.append('text')
//            .attr('fill', '#585858')
//            .attr('fill-opacity', 1)
//            .attr('x', 10)
//            .attr('y', 10)
//            .text(d=>d);
//}

function drawLegend() {
    var dataL = 0;
    var offset = 20;
    //var start = 64*4 + 50;
    var start = 0;
    var legendMenu = svgMenu.selectAll('.legendMenu')
        .data(emotions)
        .enter().append('g')
            .on('mouseover', (d, i)=>highlightSP(i, 0.1))
            .on('mouseout', (d, i)=>highlightSP(i, 0.75))
            .attr('class', 'legendMenu')
            .attr('transform', function(d, i) {
                if (i == 0) {
                    dataL = start + d.length*6 + offset;
                    return 'translate(' + start + ',0)';
                } else {
                    var temp = dataL;
                    dataL += d.length*6 + offset;
                    return 'translate(' + temp + ', 0)';
                }
            });

    legendMenu.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', (d, i) => colors[i]);

    legendMenu.append('text')
        .attr('x', 15)
        .attr('y', 9)
        .attr('cursor', 'default')
        .text(d=>d);
} drawLegend();
