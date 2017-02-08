

// d3.json('http://localhost:8080/', function(err, json){
//   if (err) console.log(err)

window.onload = function (){

const d3 = require('d3')
  console.log('loaded')
const height = window.innerHeight;
const width = window.innerWidth;

const svg = d3.select("body").append("svg")
  .attrs({
    width: width,
    height: height
  });

const nodes = svg.selectAll('nodes')
  .data(json)
  .enter()
  .append('circle')
  .attrs({
    cx: (width/2),
    cy: (height/2),
    r: 20
  })

const axis = d3.axisLeft() //scale

svg.append('g')
 .attr('class', 'axis')
 .each((d) => {})

}
/*
// Add an axis and title.
g.append("g")
  .attr("class", "axis")
  .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
.append("text")
  .style("text-anchor", "middle")
  .attr("y", -9)
  .text(function(d) { return d; });

  // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
      return d != "name" && (y[d] = d3.scale.linear()
          .domain(d3.extent(cars, function(p) { return +p[d]; }))
          .range([height, 0]));
    }));

});
*/
}
