/*
add a line to show the mean of the scores
add a way to dynamically add modules and add from command line
deal with when a borked package is requested
make sure it is obvious what the scores mean and what we are looking at
maybe we search for packages or we can add in a form document
popularity needs to have a computed scale - maybe get neighboring information
  or averages from other packages

red flag bad packages
allow ability to search

link back to npms.io
use viewport to change dynamiclly the window
.attr('viewBox', '0 0 ' + size + ' ' + size);

use a table for the subscores and show a nice patagraph that represents the
infor on the module.
stop messing with sub scores and focus on a few pieces of important information rather
than everythign
compute a full set of graphs for popularity and just highlight the one in questions

*/
'use strict'
window.onload = function() {
    const margin = {
            top: 100,
            right: 10,
            bottom: 100,
            left: 10
        },
        width = window.innerHeight,
        height = window.innerWidth,
        line = d3.line(),
        axis = d3.axisLeft(),

        y = d3.scaleLinear()
          .domain([1, 0])
          .range([0, height]),
        popY= d3.scaleLinear()
          .range([0, height]),
        sX0 = d3.scaleBand()  //group spacing
          .rangeRound([0, width])
          .paddingInner(0.1),
        ssX0 = d3.scaleBand()  //spacing for subscore groups
          .rangeRound([0, width])
          .paddingInner(0.1),
        sX1 = d3.scaleBand()  //this will compute the x values
          .padding(0.05),
        ssX1 = d3.scaleBand()  //this will compute the x values
          .padding(0.05),
        color = d3.scaleOrdinal().range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b"]); //add colors

    // const url = '/datam.json'
    // d3.request(url).mimeType('application/json').response(function(xhr) {
    //     return JSON.parse(xhr.responseText);
    // }).get(processData);
    // function processData(err, rawData) {
    //     if (err)
    //         console.log(err);


    d3.json('data1.json', function(err, data) {
        if (err) {
            console.log(err)
        };
        console.log(data)

        const pkgs = (function(){
          let names = []
          for(let pkg in data){
          names.push(data[pkg].title[1])
          }
          return names
        })()

        const subScoreHeading = ['quality', 'popularity', 'maintenance'];
        sX0.domain(pkgs)
        sX1.domain(subScoreHeading).rangeRound([0, sX0.bandwidth()]);

        ssX0.domain(['quality', 'popularity', 'maintenance']) //maybe this has to map to the groups better
        ssX1.domain(['carefulness', 'tests', 'health', 'branding', 'communityInterest', 'downloadsCount', 'downloadsAcceleration', 'dependentsCount', 'releasesFrequency', 'commitsFrequency', 'openIssues', 'issuesDistribution']).rangeRound([0, ssX0.bandwidth()]); //subScore names





        const dependencies = d3.select('.dependencies')
        .attr('width', width)
        .attr('height', height)


        const scoreScale = (function(){
          let scale = [[], [], [], []];
          for (let pkg in data){
            //console.log(data[pkg].scores[1][1])
            data[pkg].scores.forEach((cat, i) => {
              scale[i].push(data[pkg].scores[i][1])
              })
            }
            return scale
          })()
        console.log(scoreScale)

        const popularScale = (function(){    //turn into an object with three p
          let pScale = {'communityInterest':[], 'downloadsCount':[], 'downloadsAcceleration':[], 'dependentsCount':[]}
          for (let pkg in data){
            for(let i = 0; i < data[pkg].subScores[1].length; i++){
              pScale[data[pkg].subScores[1][i][0]].push(data[pkg].subScores[1][i][1])
            }
          }
          return pScale
        })()

        console.log(popularScale)



        const scores = d3.select('.scores')
          .attr('width', width)
          .attr('height', height)

        const handleMouseOver = function(e, that) {
          // d3.select(that).classed('foreground', true)
          // change the hue of the column being hovered over
        }
        const handleMouseOut = function(e, that){
          // turn off highlight
        }

        const handleClick = function(e, that){
          // popY.domain([d3.extent()]) //move
          buildInformation(e)
          buildSubScoresChart(e)
          buildDependencies(e)
        }

        const buildDependencies = function(pkg){
          let dependenciesGraph = dependencies.append('g')
          .selectAll('g')
          .data(pkg.dependencies)
          .enter();

          dependenciesGraph.append('g').merge(dependenciesGraph)
          .selectAll('circle')
          .data((d) => {
            return d[1]
          }).enter().append('circle')
          .attrs({
            cx: (d, i) => { return 20 * i},
            cy: (d, i) => { return 20 * i},
            r: (d, i) => {return 15}
          })

        }


        const title = d3.select('.pkgInformation').append('g').attr('class', 'title').append('ul')
        const gitStats = d3.select('.pkgInformation').append('g').attr('class', 'gitStats').append('ul')
        const subScores = d3.select('.pkgInformation').append('g').attr('class', 'subScores')

        const buildInformation = function(pkg){

          function buildTitle() {
            const update = title.selectAll('li')
            .data(pkg.title);
            const enter = update.enter()
            .append('li').attr('class', function(d){
                      return d[0]})

            const exit = update.exit().remove();
            update.merge(enter).text(function(d){
              return  d[1]});
          }

          function buildGitStats() {
            const update = gitStats.selectAll('li')
            .data(pkg.github)
            const enter = update.enter()
            .append('li').attr('class', function(d){
                      return d[0]})
            const exit = update.exit().remove()

            update.merge(enter).text(function(d){
              return  d[1]})
          }

          buildTitle()
          buildGitStats()
        }
        const buildSubScoresChart = function(pkg){
          const update = subScores.selectAll('th')
          .data(pkg.subScores, d => d)

          const enter = update.enter()
          .append('table').append('tr').append('th')

          const exit = update.exit().remove()

          update.merge(enter).text(function(d, i){
                      return subScoreHeading[i].toUpperCase()
                    })
                    .attr('transform', (d) => {
                      return 'translate(' + [0,0] + ')';
                    })
                    .selectAll('td')
                    .data(function(d){
                      return d
                    }).enter()
                    .append('tr')
                    .append('td')
                    .text(function(d){return d[0] + ' : ' + d[1].toFixed(2)})

        }



        const buildPopularityChart = function(pkg){
          console.log('here we are')
        }
        const buildScoresChart = scores.append('g') //maybe refactor into a single function with a let scoresChart at the beginning
          .selectAll('g')
          .data(data);

          buildScoresChart
          .enter()
          .append('g')
          .on('click', function(e){
            // send data for the entire group, not the individual bar
            handleClick(e)})
          .on('mouseover', function(e){
            handleMouseOver(e, this)})
          .on('mouseover', function(e){
            handleMouseOut(e, this)})
          .attr('transform', (d) => {
            //console.log(d)
            return 'translate(' + sX0(d.title[1]) + ',0)';
          })
          .selectAll('rect')
          .data(function(d) { //pass a loop of data
            //console.log(d)
            return d.scores})
          .enter().append('rect')
          .merge(buildScoresChart)
            .attrs({
              x: (d, i) => {return sX1(d[0])},
              y: (d, i) => {return y(d[1])},
              width: (d) => {return sX1.bandwidth()},
              height: (d) => {return height - y(d[1])},
              fill: (d) => {return color(d[0])}
            })

            buildScoresChart.exit().remove();















/*

        const formatText = function(pkg) {






            //let vulnerabilities= status.selectAll('li')
            //.data(module.vulnerabilities)

            //vulnerabilities
            //.enter()
            //.append('li')

            //.merge(vulnerabilities)
            //.text(function(d){
              //console.log(d)
              //return 'Vulnerability: ' + d;
            //})

            let outdatedDependencies = outdated.selectAll('td')
            .data(pkg.outdatedDependencies[0] || [])

            outdatedDependencies
            .enter()
            .append('td')
            .merge(outdatedDependencies)
            .text(
              function(d){
                return d;
              })

            outdatedDependencies.exit().remove()
          }

          const bubbleChart = d3.select('.bubbleChart')
            .attrs({
                width: width,
                height: height
            });

          const buildBubbleChart = function(d){
           //build chromatic scale
            let dependencies = bubbleChart.selectAll('.node') //change to circles
            .data(d.dependencies);

            dependencies
            .enter()
            .append('circle')
            .merge(dependencies)
            .attrs({
              r: Math.random() * 25,
              cx: Math.random() * 400,
              cy: Math.random() * 400,
            });

            dependencies.exit().remove()
          }


        const handleMouseOver = function(e, that) {
          d3.select(that).classed('foreground', true)
          d3.select(that).classed('background', false)
            d3.select(this)
                .attr('d', (e) => {
                    console.log(e)
                })
            formatText(e)
            buildBubbleChart(e)
        }

        const handleMouseOut = function(d, that) {
          d3.select(that).classed('foreground', true)
          d3.select(that).classed('background', false)
        }

        const path = d3.line()
            .x(function(d, i) {
                return 100 * d[2];
            })
            .y(function(d, i) {
                const tempScale= scale(pathscoreScale[i])
                return tempScale(d[1])
                //console.log(pathscoreScale[i])
                // console.log()
                // return y(d[1])
            })


        // const createPaths = g.append('g')
        //     .selectAll('path')
        //     .data(data)
        //     .enter()
        //     .append('path')
        //     .attr('class', 'background')
        //     .attr('d', (d) => {
        //       console.log('inside createpaths ' + d)
        //         return path(d.scores)
        //     })
        //     .on('mouseover', function(e){
        //       handleMouseOver(e, this)})
        //     .on('mouseout', function(e){
        //       handleMouseOut(e, this)})
        //
        // const createNodes = g.selectAll('path-to-circle')
        //   .data(data)
        //   .enter()
        //   .append('g')
        //   .attr('foo', function(d){
        //     //console.log(d)
        //   })
        //   .selectAll('circle')
        //   .data(function(d){
        //     return d.scores
        //   })
        //   .enter()
        //   .append('circle')
        //   .attr('gg', function(d){
        //   } )
        //   .attr('cx', function(d){return d[2]})
        //   .attr('cy', function(d){return d[1]}) //pass through sclaing function
        //   .attr('r', '25px')
        //





          // .each(function(d){
          //     d3.select(this).append('circle')
          //     .attr('d', function(d){
          //       console.log(d)
          //     })
              // .each(function(d))
              // d.scores.each((p ,i) => (console.log(p[2] + '  :  ' +  i)))
            //})

          // .append('circle')
          // // .attr('d', function(d){})
          //





        // const verticalAxis = g.append('g')
        //     .attr('class', 'axis')
        //     .selectAll('axis')
        //     .data(data[0].scores)
        //     .enter()
        //     .each(function(d, i) {
        //         d3.select(this)
        //             .append('g')
        //             .attr('transform', 'translate(' + [
        //                 (100 * i), 0
        //             ] + ')')
        //             .call(axis.scale(y)) //change scale
        //     })


        // const widthScale = function(arr, d) {
        //     console.log('here' + d)
        //     console.log(arr)
        //     const wScale = d3.scaleLinear()
        //         .domain(d3.extent(arr))
        //         .range([0, 75]);
        //     console.log(wScale(d))
        //     return wScale(d)
        // }
        //
        // const heightScale = function(arr, d) {
        //     const hScale = d3.scaleLinear()
        //         .domain(d3.extent(arr))
        //         .range([0, 200]);
        //     return hScale(d)
        // }

*/
    })

}
