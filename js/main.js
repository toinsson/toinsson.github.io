$(function() {
    $("#tfq2b").click(function() {
        if ($("#tfq2b").val() == "Search our website"){
            $("#tfq2b").val(""); 
        }
    });
});

/* Create a cache object */
var cache = new LastFMCache();

/* Create a LastFM object */
var lastfm = new LastFM({
  apiKey    : 'f21088bf9097b49ad4e7f487abab981e',
  apiSecret : '7ccaec2093e33cded282ec7bc81c6fca',
  cache     : cache
});

/* Load some artist info. */
lastfm.artist.getInfo({artist: 'The xx'}, {success: function(data){
  /* Use data. */
}, error: function(code, message){
  /* Show error message. */
}});
