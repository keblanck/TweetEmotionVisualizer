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

var blockRT;
function wrapRT(text, width) {
    text.each(function() {
        var text = d3.select(this);
        var words = text.text().split(/\s+/).reverse();
        var word;
        var line = [];
        var lineNumber = 0;
        var lineHeight = 1.25;
        var y = text.attr('y');
        var x = text.attr('x');
        var dy = 0;
        var tspan = text.text(null)
            .append('tspan')
            .attr('x', x)
            .attr('y', y)
            .attr('dy', dy + 'em');
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = text.append('tspan')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('dy', (++lineNumber * lineHeight + dy) + 'em')
                    .text(word);
            }
        }
    });
}

function drawRawTweets(tweets, date) {
    if (blockRT) {
        blockRT.selectAll('text').remove();
        blockRT.selectAll('line').remove();
    }
    var textWidth = widthRT/4;
    var textHeight = heightDV/2;
    
    var tweetData = [];
    
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    
    date = new Date(year, month, day);

    for (i = 0; i < tweets.length; i++) {
        if (tweets[i]['compDate'] == date.getTime()) {
            tweetData.push({
                text: tweets[i]['tweet'],
                date: tweets[i]['fullDate'],
                retweets: tweets[i]['RTs'],
                favorites: tweets[i]['favs']
            });
        }
    }

    console.log(tweetData);
    
    blockRT = RT.append('g')
        .attr('class', 'rawText')
        .attr('fill', 'black')
        .attr('font-weight', 'normal')
        .attr('text-anchor', 'start')
        .style('font', '10px sans-serif')
        .attr('transform', 'translate(20, 0)');
    
    var col = 0;
    var row = 0;
    for (i = tweetData.length -1; i > -1; i--) {
        //blockRT.append('rect')
        //    .attr('x', col*textWidth)
        //    .attr('y', row*textHeight)
        //    .attr('width', textWidth)
        //    .attr('height', textHeight)
        //    .attr('fill', '#efefef');

        blockRT.append('text')
            .attr('x', col*textWidth)
            .attr('y', 20 + row*textHeight)
            .text(tweetData[i]['text'])
            .call(wrapRT, textWidth*.8);
        blockRT.append('text')
            .attr('x', col*textWidth)
            .attr('y', (row+1)*textHeight - 8)
            .attr('font-weight', 'bold')
            .text(String(tweetData[i]['date']).split('(')[0]);
        blockRT.append('line')
            .attr('x1', col*textWidth)
            .attr('x2', (col+1)*textWidth - 15)
            .attr('y1', textHeight)
            .attr('y2', textHeight)
            .attr('stroke-weight', 1)
            .attr('stroke', 'black');
        row += 1;
        if (row == 2) {
            col += 1;
            row = 0;
        }
        console.log('col: ', col);
        console.log('col*textWidth: ', col*textWidth);
        console.log('row: ', row);
    }
    //console.log();
}




