// remove text
$(function() {
    $("#searchInput").click(function() {
        // if ($("#searchInput").val() == "Mouse"){
            $("#searchInput").val(""); 
        // }
    });
});

// perform the search
$(function() {
    $("#searchButton").click(function() {
        console.log("yolo");
        var searchInputVal = $("#searchInput").val()
        console.log(searchInputVal);
        clearGraph();
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

// CONSTANT
var N_SIMILAR = 5;

// init the graph
width = 960,
height = 500;
$(function() {
    svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
});
var force = d3.layout.force()
    .gravity(.05)
    .distance(100)
    .charge(-100)
    .size([width, height]);

force
    .nodes(graph["nodes"])
    .links(graph["links"]);
    // .start();    

// clear the graph
function clearGraph() {
    var node = svg.selectAll(".node"),
        link = svg.selectAll(".link");

    node.remove();
    link.remove();
    // do not remove reference to the initial list that is stored in force
    graph["nodes"].length = 0;
    graph["links"].length = 0;

    console.log(graph);
}

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

            for (i = 0; i < N_SIMILAR; i++) {
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
            drawTree();
        }, 
        error: function(code, message){
            /* Show error message. */
            console.log("5");
        }
    });
}



function drawTree() {

    var link = svg.selectAll(".link")
        .data(graph["links"]);

    link.enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(graph["nodes"]);

    // create new nodes and append circle and text as children
    node.enter().append("g")
        .attr("class", "node")
        .call(force.drag);
    node.append("circle")
        .attr("r", 10)
        .style("fill", "purple");
    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });

    node.on("click", function(d){
        var node = d3.select(this);
        console.log(d.name);
        appendNewSimilar(d);
    })

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
    force.start();
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
            console.log(data);

            // create the graph structure
            var i;
            for (i = 0; i < N_SIMILAR; i++) {
                var tmp = data["similarartists"]["artist"][i]

                // check if valid structure
                if (tmp["mbid"] !== "") {
                    var child = {"id":tmp["mbid"], "name":tmp["name"]};
                    var existingChild = containsNode(child, graph.nodes);

                    if (existingChild) {
                        child = existingChild;
                        var existingEdge = containsEdge(parent, child, graph.links);
                        if (existingEdge) {}
                        else {
                            var link = {"source":parent, "target":child};
                            graph["links"].push(link);
                        }
                    }
                    else { // add both node and edge
                        graph["nodes"].push(child);
                        var link = {"source":parent, "target":child};
                        graph["links"].push(link);
                    }
                }
            }

            console.log(graph);
            // print the graph of similar
            drawTree();
        },
        error: function(code, message){
            /* Show error message. */
            console.log("5");
        }
    });
}

function containsNode(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].id === obj.id) {
            return list[i];
        }
    }
    return false;
}
function containsEdge(src, trg, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if ((list[i].source.id === src.id || list[i].source.id === trg.id) && 
            (list[i].target.id === src.id || list[i].target.id === trg.id)) {
            return true;
        }
    }
    return false;
}

// Toggle children on click.
// function click(d) {
//   if (d3.event.defaultPrevented) return; // ignore drag
//   if (d.children) {
//     d._children = d.children;
//     d.children = null;
//   } else {
//     d.children = d._children;
//     d._children = null;
//   }
//   update();
// }

// API Key: f8681037a8e1f6fc900b5d5f48cb160c
// Secret: is 1c8667d1473872145606a4b065f096a0




















