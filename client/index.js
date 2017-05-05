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


Anticipate vulnerabilities in the packages you rely on- have an opening div that is replaced
once someone clicks
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
        axisScale = d3.scaleBand()  //group spacing
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

        const pkgNames = (function(){
          let names = []
          for(let pkg in data){
          names.push(data[pkg].title[0][1])
          }
          return names
        })()

        console.log(pkgs)

        const subScoreHeading = ['quality', 'popularity', 'maintenance'];
        sX0.domain(pkgs)
        sX1.domain(subScoreHeading).rangeRound([0, sX0.bandwidth()]);

        ssX0.domain(['quality', 'popularity', 'maintenance']) //maybe this has to map to the groups better
        ssX1.domain(['carefulness', 'tests', 'health', 'branding', 'communityInterest', 'downloadsCount', 'downloadsAcceleration', 'dependentsCount', 'releasesFrequency', 'commitsFrequency', 'openIssues', 'issuesDistribution']).rangeRound([0, ssX0.bandwidth()]); //subScore names


        const star = '\u2605';   //U+2606 for other star


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

        // const popularScale = (function(){    //turn into an object with three p
        //   let pScale = {'communityInterest':[], 'downloadsCount':[], 'downloadsAcceleration':[], 'dependentsCount':[]}
        //   for (let pkg in data){
        //     for(let i = 0; i < data[pkg].subScores[1].length; i++){
        //       pScale[data[pkg].subScores[1][i][0]].push(data[pkg].subScores[1][i][1])
        //     }
        //   }
        //   return pScale
        // })()
        //
        // console.log(popularScale)



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
          buildDependencies(e)
        }

        //dependencyLinks

        const simulation = d3.forceSimulation()
        .force("collide",d3.forceCollide( function(d){return d.r + 8 }).iterations(16))
        .force('center', d3.forceCenter(width/2, height/2))
        .force("charge", d3.forceManyBody())
        .force("y", d3.forceY(0))
        .force("x", d3.forceX(0));

        const buildDependencies = function(pkg){


          /////////////////////////////////////////////////////
          const update = dependencies.selectAll('g.circles')
          .data(pkg.dependencies, d => d)

          const enter = update.enter().append('g')
          .attr('transform', (d) => {
            return 'translate(' + ~~(Math.random() * 300) + ',' + ~~(Math.random() * 300) + ')'
          })
          .attr('class', 'circles');

          enter.append('circle')
          .attr('fill', function(d){
            return '#43985E'
          });

          enter.append('text')
          .text(function(d){
            return d[1]
          });

          const exit = update.exit().remove();

          update.merge(enter).selectAll('circle').attrs({
              r: 5
            })
          .attr('class', function(d){
            d[0]
          })


          simulation
            .nodes(pkg.dependencies)
            .on('tick', ticked)

          function ticked(){
            enter
              .attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
            }
          }


        const title = d3.select('.pkgInformation').append('g').attr('class', 'title')
        const gitStats = d3.select('.pkgInformation').append('g').attr('class', 'gitStats')

        const buildInformation = function(pkg){
          function capitalize(str){
            return str.charAt(0).toUpperCase() + str.slice(1)
          }

          //don't bind the data, just use
          // for loops to bind the data
          //to span elements and change the inner html
          //hardcode all inside the html and focus on the arts that matter



          function buildTitle() {
            const update = title.selectAll('span')
            .data(pkg.title);
            const enter = update.enter()
            .append('span').attr('class', function(d){
                      return d[0]})

            const exit = update.exit().remove();


            update.merge(enter).text(function(d){
              return  d[1]});
          }

          function buildGitStats() {
            const update = gitStats.selectAll('span')
            .data(pkg.github)
             const enter = update.enter()//.attr('d', function(d){
              // if (d[0] === 'forks'){
              //   return .append('svg:image').attr('xlink:href', '../assets/fork.png')
              // }
              // else {


              //           const star = '\u2605';   //U+2606 for other star
              // }
            // })
            .append('span').attr('class', function(d){
                      return d[0]})
            const exit = update.exit().remove()

            update.merge(enter).text(function(d){
              return  d[1]})
          }

          function buildSS(){
            for (let i = 0; i < subScoreHeading.length; i++){
              for(let j = 0; j < 4; j++){
                document.getElementById(subScoreHeading[i] + j).innerText = pkg.subScores[i][j][1]  //set up pretty print
              }
            }
          }

          buildSS()
          buildTitle()
          buildGitStats()
        }




        // const subScores = d3.select('.pkgInformation').append('g')
        // .attr('class', 'subScores').append('table')
        //
        // subScores.append('td').text('Quality')
        // subScores.append('td').text('Popularity')
        // subScores.append('td').text('Maintenance')


        // const buildSubScoresChart = function(pkg){
        //
        //   const update = subScores.selectAll('td')
        //   .data(pkg.subScores, d => d)
        //
        //   const enter = update.enter()
        //
        //   const exit = update.exit().remove()
        //
        //   update.merge(enter).append('tr')
        //             .selectAll(' tr td')
        //             .data(function(d){
        //               return d
        //             }).enter()
        //             .append('td')
        //             .text(function(d){return d[0] + ' : ' + d[1].toFixed(2)})
        //
        //
        // }



        // const buildPopularityChart = function(pkg){
        //   console.log('here we are')
        // }
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


        scores.append('g')
        .attr('class', 'axis')
        .attr("transform", "translate(0," + 450 + ")")
        .call(d3.axisBottom(axisScale.domain(pkgNames)))
        .selectAll('text')
        .attr('transform', 'rotate(90)')  //they neeed to be shifted down to fit














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
