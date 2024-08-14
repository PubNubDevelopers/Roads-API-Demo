var clickedPoints = [];
var clickedRoute = null;

async function initMap() {
  // Request libraries when needed, not in the script tag.
  const { Map } = await google.maps.importLibrary("maps");
  // Short namespaces can be used.
  map = new Map(document.getElementById("map"), {
    center: { lat: 40.752655, lng: -73.987295 },
    zoom: 18,
    minZoom: 2,
    //mapTypeId: "OSM",
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    scaleControl: false,
    rotateControl: false,
    gestureHandling: "none",
    clickableIcons: false,
    draggableCursor: "crosshair"
  });
  map.addListener("click", (event) => {
    //console.log('click')
    clickedPoints.push({lat: event.latLng.lat(), lng: event.latLng.lng()})
    updateClickedLine();
    pubnub.signal({
      channel: channelName,
      message: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },
    });
  });
  //Define OSM map type pointing at the OpenStreetMap tile server
  /*map.mapTypes.set(
    "OSM",
    new google.maps.ImageMapType({
      getTileUrl: function (coord, zoom) {
        // "Wrap" x (longitude) at 180th meridian properly
        // NB: Don't touch coord.x: because coord param is by reference, and changing its x property breaks something in Google's lib
        var tilesPerGlobe = 1 << zoom;
        var x = coord.x % tilesPerGlobe;
        if (x < 0) {
          x = tilesPerGlobe + x;
        }
        // Wrap y (latitude) in a like manner if you want to enable vertical infinite scrolling

        return (
          "https://tile.openstreetmap.org/" +
          zoom +
          "/" +
          x +
          "/" +
          coord.y +
          ".png"
        );
      },
      tileSize: new google.maps.Size(256, 256),
      name: "OpenStreetMap",
      maxZoom: 18,
    })
  );*/
}

function updateClickedLine() {
  if (clickedRoute) {
    clickedRoute.setMap(null);
  }
  clickedRoute = new google.maps.Polyline({
    path: clickedPoints,
    geodesic: true,
    strokeColor: "#0000FF",
  });
  clickedRoute.setMap(map);
}
