// Example adapted from Mike Bostock: https://bl.ocks.org/mbostock/3885304
// Modified to work with d3.v5
console.log('Hello from main.js');

// create our SVG canvas and give it the height and width we want
var svgMP = d3.select('#mainPort').append('svg')
    .attr('width', window.innerWidth-margin.right)
    .attr('height', window.innerHeight/2.5 + 5) //space before next box
    .attr('text-anchor', 'middle')
    .style("font", "10px sans-serif");

var heightMP = window.innerHeight/2.5 - margin.bottom; //space to actually work in
var widthMP = window.innerWidth - margin.right;
var heightBub = window.innerHeight/8;
var widthBub = heightBub;

var MP = svgMP.append('g')
           .attr('transform', 'translate(0,0)');

var xMP;
var yMP;
var areaMP;
var profileMP;
var xAxisMP;

MP.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', heightMP)
    .attr('width', widthMP)
    .attr('fill', '#efefef')
    .attr('fill-opacity', 0.3);

function highlightSP(idx, op) {
    MP.selectAll('.streamSP')
        .filter(function (d, i) {
            return i != idx;
        })
        .transition()
        .style('fill-opacity', op);
    if (blockTF) { 
        if (op == 0.75) 
            { op = 1; }
        blockTF.selectAll('text')
            .filter(function (d, i) {
                return filteredData[i]['emotion'].toLowerCase() != emotions[idx];
            })  
            .transition()
            .style('fill-opacity', op);
    }
}
async function drawMP(dataMP) {
    console.log('inside');
    //var dataMP = await volume();
    const dates = dataMP.dates;
    const counts = dataMP.count;
    const tweets = dataMP.tweets;
    const emotionsMP = dataMP.emotes;
    const comp = dataMP.comp;

    var volumeMP = [];
    for (i = 0; i < dates.length; i++) {
        volumeMP.push({date: dates[i], count: counts[i]});
    }
    
    xMP = d3.scaleTime()
        .domain(xOV.domain())
        .range([0, widthMP]);
    console.log(xMP.range());
    yMP = d3.scaleLinear()
    //yMP = d3.scaleSqrt()
        .domain(d3.extent(counts))
        .range([heightMP, 10]);

    console.log('inside');    
    areaMP = d3.area()
        .curve(d3.curveMonotoneX)
        .x(d=>xMP(d.date))
        .y0(yMP(0))
        .y1(d=>yMP(d.count));

    xAxisMP = d3.axisBottom(xMP)
        //.ticks(7)
        .tickSizeOuter(0);
    //yAxisMP = d3.axisRight(yMP);

    MP.append('g')
        .attr('class', 'xAxisMP')
        .attr('transform', 'translate(0, ' + heightMP + ')')
        .call(xAxisMP)
        .call(g => g.select('.domain').remove());
    


    profileMP = MP.append('path')
        .datum(volumeMP)
        .attr('class', 'profileMP')
        .attr('fill', '#585858')
        .attr('fill-opacity', 0.6)
            .on('click', function() {
                bub.selectAll('g').remove();
                bub.selectAll('circle').remove();
            })
        .attr('d', areaMP);
    makeStream(emotionsMP, dates, comp, 0, 0, tweets);
}

function getDateSP(data, mouseX) {
    mouseX = mouseX[0];
    var invX = xMP.invert(mouseX);
    //console.log(invX);
    return invX;
}

var yAxisSP;
var ySP;
var areaSP;
function makeStream(feelings, dates, comp, r, sel, tweets) {
    console.log('looking for this');
    console.log(feelings);
    console.log('r', r);
    console.log('sel', sel);
    console.log('tweets', tweets);
    if (r == 1) {
        MP.selectAll('.streamSP').remove();
        //return;
    }
    
    ySP = d3.scaleLinear()
        .domain([-1, 1])
        .range([heightMP, 10]);
        //.range([heightMP, 10]);
   
    ySPshown = d3.scaleLinear()
        .domain([0, 1])
        .range([heightMP, 10]);

    yAxisSP = d3.axisRight(ySPshown);
    

    emoBand = [];
    //var sel = 0; //based on intensity
    for (i = 0; i < feelings.length; i++) {
        var total = 0.0001;
        var avgV = 0;
        var avgA = 0;
        var avgD = 0;
        //var totalV = 0.0001;
        for (j = 0; j < 8; j++) {
            total += feelings[i][j][sel];
            avgV += feelings[i][j][1];
            avgA += feelings[i][j][2];
            avgD += feelings[i][j][2];
        }
        avgV /= 8;
        avgA /= 8;
        avgD /= 8;
        emoBand.push({
            date: dates[i],
            anger: feelings[i][0][sel]/total,
            anticipation: feelings[i][1][sel]/total,
            disgust: feelings[i][2][sel]/total,
            fear: feelings[i][3][sel]/total,
            joy: feelings[i][4][sel]/total,
            sadness: feelings[i][5][sel]/total,
            surprise: feelings[i][6][sel]/total,
            trust: feelings[i][7][sel]/total,
            //valence: feelings[i][0][1] //anger's valence
            valence: avgV, //average valence
            arousal: avgA,
            dominance: avgD
        });
    }
    
    var domBand = [];
    for (i = 3; i < emoBand.length; i+=7) {
        var avgD = 0;
        var count = 0;
        for (j = -3; j <= 3; j++) {
            if (emoBand[i+j]) {
                avgD += emoBand[i+j].dominance;
                count++;
            }
        }
        avgD /= count;
        domBand.push( {
            date: emoBand[i].date,
            val: emoBand[i].valence,
            dom: avgD
        });
    }

    var valLine = [];
    for (i = 0; i < emoBand.length; i++) {
        valLine.push( {
            date: emoBand[i].date,
            val: emoBand[i].valence
        });
    }

    drawOVline(valLine);
    
    console.log('emoBand');
    console.log(emoBand);
    var emoStack = d3.stack()
        .keys(emotions)
        //.order(d3.stackOrderAppearance)
        .offset(d3.stackOffsetSilhouette);
//;
    var stackedEmo = emoStack(emoBand);
    console.log(stackedEmo);
    

    areaSP = d3.area()
        .curve(d3.curveBasis)
        .x(d=>xMP(d.data.date))
        .y0(d=>ySP(d[0] + d.data.valence))
        .y1(d=>ySP(d[1] + d.data.valence));
    //var aro = d3.scaleSqrt()
    //    .domain([0, 1])
    //    .range([0, 1]);
//    var mX;
    var num = 0;
    var streamSP = MP.selectAll('.streamSP')
        .data(stackedEmo)
        .enter().append('path')
            .attr('class', 'streamSP')
            .attr('cursor', 'pointer')
            .attr('fill', function(d, i) { 
                return colors[i];
                //return d3.rgb(colors[i]).darker(d.arousal)
                ; })
            .attr('fill-opacity', 0.9)
            .attr('d', areaSP)
            .on('click', function (d, i) {
                num++;
                var mX = d3.mouse(this);
                var date = getDateSP(d, mX);
                drawRawTweets(tweets, date);
                drawTriggerWords(tweets, date);
                return makeBubbles(date, comp, feelings, i, mX, num);
            })
            //.on('mouseout', function() {
            //    bub.selectAll('g').transition().remove();
            //    bub.selectAll('circle').transition().remove();
            //})
            ;
    var domValPlot = MP.selectAll('.domValPlot')
        .data(domBand)
        .enter().append('g')
            .attr('class', 'domValPlot')
            .attr('transform', d=>'translate(' + xMP(d.date) + ',' + ySP(d.val) + ')')
            ;
        
    domValPlot.append('circle')
            //.attr('class', 'domValPlot')
        .attr('r', 8)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', '#585858');
    domValPlot.append('svg:image')
        .attr('x', -7.2)
        .attr('y', -7.2)
        .attr('transform', d=>'rotate(' + bubTilt(d.dom) + ')')
        .attr('width', 14.4)
        .attr('height', 14.4)
        .attr('xlink:href', 'arrow.png');

    MP.append('g')
        .attr('transform', 'translate(-1, 0)').call(yAxisSP)
        .call(g => g.select('.tick:first-of-type').remove())
        .call(g => g.select('.tick:last-of-type text').clone()
            .attr('x', 30)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text('valence'));
    MP.append('g')
        .attr('class', 'yAxisMP')
        .attr('transform', 'translate(' + widthMP + ',0)')
        .call(d3.axisLeft(yMP).ticks(7).tickSizeOuter(0))
        .call(g => g.select('.tick:last-of-type text').clone()
            .attr('x', -30)
            .attr('text-anchor', 'end')
            .attr('font-weight', 'bold')
            .text('# of tweets'));
}

var bub;
function packBub(data) {
    packItem = d3.pack(data)
        .size([widthBub, heightBub])
        .padding(1)
        (d3.hierarchy({children: data})
            .sum(d=>d.strength));
    return packItem;
}

//function appendTip(data, idx) {
//    bub.append('rect')
//        .attr('x', widthBub)
//        .attr('y', 0)
//        .attr('height', heightBub)
//        .attr('width', widthBub)
//        .attr('fill', 'white')
 //       .attr('fill-opacity', 0.9)
//        .attr('class', 'tip');
//    bub.append('text')
//            .attr('font', '10px sans-serif')
//            .attr('x', 2)
//            .attr('y', function (data, idx) { return i*12;} )
//            .attr('fill', '#585858')
 //           .text(data.name);
  //  //for (i = 0; i < 4; i++) {
    //    bub.append('text')
    //        .attr('font', '10px sans-serif')
    //        .attr('x', 10)
    //        .attr('y', function (data, idx) { return ++i*12;} )
    //        .text(dimension[idx] + ': ' + 'data.'shortDim[i]);
    //}
//}

//function removeTip(data) {
//    bub.selectAll('rect').remove();
//}


// Define the tooltip
var tooltipBub = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("color", "white")
    .style("padding", "10px")
    .style("background-color", "rgba(0, 0, 0, 0.75)")
    .style("border-radius", "6px")
    .style("font", "16px sans-serif")
    .text("tooltip");

var tooltipBub;
var bubTilt = d3.scaleLinear()
        .domain([0, 1])
        .range([90, -90]);

function makeBubbles(date, dates, feelings, emoIdx, mX, r) {
    if (r > 1) {
        bub.selectAll('g').remove();
        bub.selectAll('circle').remove();
        bub.selectAll('rect').remove();
    }

    bub = svgMP.append('g')
        .attr('transform', 'translate(' + (mX[0] - widthBub/2) + ',' + (mX[1] - heightBub/2) + ')');
    bub.append('circle')
        .attr('class', 'bub')
        .attr('transform', 'translate(' + widthBub/2 + ',' + heightBub/2 + ')')
        //.attr('x', widthBub/2)
        //.attr('x', 0)
        //.attr('y', 0)
        //.attr('y', heightBub/2)
        .attr('r', widthBub/2)
        .attr('fill', 'white')
        .attr('fill-opacity', 0.7);

    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();

    var d = new Date(year, month, day);
    //console.log(d); //check date matches above 
    var dC = d.getTime();
    //console.log(dC); //check number for comp dates array
    
    var idx = dates.indexOf(dC);
    var bubMat = feelings[idx];
    
    if (!bubMat) { bubMat = feelings[idx+1]; }
    
    var bubData = [];
    for (i = 0; i < 8; i++) {
        bubData.push({
            name: emotions[i],
            strength: bubMat[i][0],
            val: bubMat[i][1],
            aro: bubMat[i][2],
            dom: bubMat[i][3]
        });
    }


    var bubRoot = packBub(bubData);
    var bubLeaf = bub.selectAll('g.bub')
        .data(bubRoot.leaves())
        .enter().append('g')
            .attr('class', 'bub')
            .attr('transform', d=> 'translate(' + (d.x + 1) + ',' + (d.y + 1) + ')');
   
    //console.log(bubRoot.leaves());
    var bubBase = bubLeaf.append('circle')
        .attr('class', 'bub')
        .attr('r', d=>d.r)
        .attr('fill-opacity', 0.9)
        //.on('mouseover', (d, i)=>appendTip(d, i))
        //.on('mouseout', d=>removeTip())
        .attr('fill', (d, i) => d3.rgb(colors[i]).darker([d.data.aro]))
        .on("mouseover", function(d) {
          console.log("bubbleData: ", d.data)
          tooltipBub.html("<i>" + d.data.name + "</i>" + "</br>"
          + "<b>valence:</b> " + (d.data.val).toFixed(2) + "</br>"
          + "<b>arousal:</b> " + (d.data.aro).toFixed(2) + "</br>"
          + "<b>dominance:</b> " + (d.data.dom).toFixed(2) + "</br>"
          + "<b>strength:</b> " + (d.data.strength * 100).toFixed(2) + "%");
          tooltipBub.style("visibility", "visible");
        })
        .on("mousemove", function() {
          return tooltipBub.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
        })
        .on("mouseout", function() {
          return tooltipBub.style("visibility", "hidden");
        });
    
    bubLeaf.append('svg:image')
        .attr('x', d=>-d.r*0.9)
        .attr('y', d=>-d.r*0.9)
        .attr('transform', d=>'rotate(' + bubTilt(d.data.dom) + ')')
        .attr('class', 'bub')
        .attr('width', d=>d.r*1.8)
        .attr('height', d=>d.r*1.8)
        .attr('xlink:href', 'arrow.png')
        .on("mouseover", function(d) {
          //console.log("bubbleData: ", d.data)
          tooltipBub.html("<i>" + d.data.name + "</i>" + "</br>"
          + "<b>valence:</b> " + (d.data.val).toFixed(2) + "</br>"
          + "<b>arousal:</b> " + (d.data.aro).toFixed(2) + "</br>"
          + "<b>dominance:</b> " + (d.data.dom).toFixed(2) + "</br>"
          + "<b>strength:</b> " + (d.data.strength * 100).toFixed(2) + "%");
          tooltipBub.style("visibility", "visible");
        })
        .on("mousemove", function() {
          return tooltipBub.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
        })
        .on("mouseout", function() {
          return tooltipBub.style("visibility", "hidden");
        });
}

console.log('down');
