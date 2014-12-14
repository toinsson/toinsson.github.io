// remove default text
$(function() {
    $("#searchInput").click(function() {
        if ($("#searchInput").val() == "Mouse"){
            $("#searchInput").val(""); 
        }
    });
});

// perform the search
$(function() {
    $("#searchButton").click(function() {
        console.log("yolo");
        var searchInputVal = $("#searchInput").val()
        console.log(searchInputVal);
        getNewArtist(searchInputVal);
    });
});

// decorate with icon
$(function() {
    $("#searchButton").button(
        {icons: {primary: "ui-icon-search"},text: false}
    );
});

// enable submit button
$(function() {
    $("input[type=submit], a, button")
        .button()
        .click(function( event ) {
        event.preventDefault();
    });
});

// global variables - temporary !
var graph = {};
graph["nodes"] = [];
graph["links"] = [];

var cache = new LastFMCache();
var lastfm = new LastFM({
    apiKey    : 'f8681037a8e1f6fc900b5d5f48cb160c',
    apiSecret : '1c8667d1473872145606a4b065f096a0',
    cache     : cache
});

// init the graph
$(function() {
    width = 960,
    height = 500;
    svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
});

// get new artist
function getNewArtist(artistName) {

    var parent = {};
    /* artist info */
    lastfm.artist.getInfo({artist: artistName}, 
        {success: function(data){
            console.log("getInfo");
            console.log(data);
            parent["id"] = data["artist"]["mbid"];
            parent["name"] = data["artist"]["name"];

            graph["nodes"].push(parent); // if not exist
        }, 
        error: function(code, message){
            /* Show error message. */
            console.log("5");
        }
    });

    /* artist's similar */
    lastfm.artist.getSimilar({artist: artistName}, 
        {success: function(data){
            /* Use data. */
            console.log("getSimilar");
            console.log(data);

            // create the graph structure
            var i;
            // var parent = {"id":i,
                // "name":data["similarartists"]["artist"][i]["name"]};

            for (i = 0; i < 10; i++) {
                var tmp = data["similarartists"]["artist"][i]
                // add a check on mbid
                if (tmp["mbid"] !== "") {
                    var child = {"id":tmp["mbid"], "name":tmp["name"]};
                    graph["nodes"].push(child);
                    var link = {"source":parent, "target":child}
                    graph["links"].push(link);  
                }
            }

            console.log(graph);
            // print the graph of similar
            drawTree(graph["nodes"], graph["links"]);
        }, 
        error: function(code, message){
            /* Show error message. */
            console.log("5");
        }
    });
}



function drawTree(nodes, links) {

    var force = d3.layout.force()
        .gravity(.05)
        .distance(100)
        .charge(-100)
        .size([width, height]);

    force
        .nodes(nodes)
        .links(links)
        .start();

    var link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    node.append("circle")
        .attr("r", 10)
        .style("fill", "purple");

    node.on("click", function(d){
        var node = d3.select(this);
        console.log(d.name);
        appendNewSimilar(d);
    })

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
}

function appendNewSimilar(parent) {
    console.log(parent);

    console.log(graph);

    console.log(graph.nodes.indexOf(parent));
    /* artist's similar */
    lastfm.artist.getSimilar({artist: parent.name}, 
        {success: function(data){
            /* Use data. */
            // console.log("getSimilar");
            // console.log(data);

            // create the graph structure
            var i;
            for (i = 0; i < 10; i++) {
                var tmp = data["similarartists"]["artist"][i]

                // check if valid structure
                if (tmp["mbid"] !== "") {
                    var child = {"id":tmp["mbid"], "name":tmp["name"]};
                    var existingChild = containsObject(child, graph.nodes);
                    if (existingChild) {
                        child = existingChild;
                    } else {
                        graph["nodes"].push(child);
                    }
                    var link = {"source":parent, "target":child}
                    graph["links"].push(link);
                }
            }

            // console.log(graph);
            // print the graph of similar
            drawTree(graph["nodes"], graph["links"]);
        }, 
        error: function(code, message){
            /* Show error message. */
            console.log("5");
        }
    });
}


function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].mbid === obj.mbid) {
            return list[i];
        }
    }
    return false;
}
    // node.append("image")
    //     .attr("xlink:href", "https://github.com/favicon.ico")
    //     .attr("x", -8)
    //     .attr("y", -8)
    //     .attr("width", 16)
    //     .attr("height", 16);

function drawTree3(nodes, links) {
    var force = d3.layout.force()
    .gravity(.05)
    .distance(100)
    .charge(-100)
    .size([width, height]);
    // var force = d3.layout.force()
    //     .size([width, height]);

    // Start the force layout.
    force
    .nodes(nodes)
    .links(links)
    .start();

    // Create the link lines.
    var link = svg.selectAll(".link")
    .data(links)
    .enter().append("line")
    .attr("class", "link");

    // Create the node circles.
    var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .call(force.drag);

    node.append("image")
    .attr("xlink:href", "https://github.com/favicon.ico")
    .attr("x", -8)
    .attr("y", -8)
    .attr("width", 16)
    .attr("height", 16);

    node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name });
    // .attr("r", 4.5)
    // .attr("name", function(d) { return d["name"]; })
    // .on('mouseover', function(d){
    //     var nodeSelection = d3.select(this).style({opacity:'0.8'});
    //     nodeSelection.select("name").style({opacity:'1.0'});
    // });
    // force.on("tick", function() {
    //   link.attr("x1", function(d) { return d.source.x; })
    //       .attr("y1", function(d) { return d.source.y; })
    //       .attr("x2", function(d) { return d.target.x; })
    //       .attr("y2", function(d) { return d.target.y; });

    //   node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    // });
    // node.append("text")
    //     .attr("dx", 12)
    //     .attr("dy", ".35em")
    //     .text(function(d) { return d.name });

    // Start the force layout.
    force
    //     .nodes(nodes)
    //     .links(links)
    .on("tick", tick);
    //     .start();

    function tick() {
    link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
    }
}

function drawTree1() {
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 960 - margin.right - margin.left,
    height = 500 - margin.top - margin.bottom;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // root = treeData[0];

    update(tree, svg, diagonal, graph);
}

function update(tree, svg, diagonal, source) {
    var i = 0;

    // Compute the new tree layout.
    var nodes = tree.nodes(graph).reverse(),
    links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Declare the nodesâ€¦
    var node = svg.selectAll("g.node")
    .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { 
    return "translate(" + d.y + "," + d.x + ")"; });

    nodeEnter.append("circle")
    .attr("r", 10)
    .style("fill", "#fff");

    nodeEnter.append("text")
    .attr("x", function(d) { 
    return d.children || d._children ? -13 : 13; })
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) { 
    return d.children || d._children ? "end" : "start"; })
    .text(function(d) { return d.name; })
    .style("fill-opacity", 1);

    // Declare the linksâ€¦
    var link = svg.selectAll("path.link")
    .data(links, function(d) { return d.target.id; });

    // Enter the links.
    link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", diagonal);

}


// API Key: f8681037a8e1f6fc900b5d5f48cb160c
// Secret: is 1c8667d1473872145606a4b065f096a0




















