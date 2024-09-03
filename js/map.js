var clickedPoints = [];
var clickedRoute = null;
var vehicleMarker = null;
const truck_svg_string =
  '<svg xmlns="http://www.w3.org/2000/svg"  width="30" height="30" viewBox="0 0 640 512"><path d="M48 0C21.5 0 0 21.5 0 48L0 368c0 26.5 21.5 48 48 48l16 0c0 53 43 96 96 96s96-43 96-96l128 0c0 53 43 96 96 96s96-43 96-96l32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64 0-32 0-18.7c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7L416 96l0-48c0-26.5-21.5-48-48-48L48 0zM416 160l50.7 0L544 237.3l0 18.7-128 0 0-96zM112 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm368-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>'
const satellite_svg_string = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"  viewBox="0 0 512 512"><path d="M502.6 310l-96.7 96.7a31.9 31.9 0 0 1 -45 0L280.6 326.3l-9.9 9.9a190.6 190.6 0 0 1 -5.4 168.5c-4.5 8.5-16.4 9.6-23.2 2.8L134.5 400.1l-17.8 17.8c.7 2.6 1.6 5 1.6 7.8a32 32 0 1 1 -32-32c2.8 0 5.2 .9 7.8 1.6l17.8-17.8L4.4 269.9c-6.8-6.8-5.7-18.6 2.8-23.2a190.6 190.6 0 0 1 168.5-5.4l9.8-9.8-80.3-80.4a32 32 0 0 1 0-45.1L202 9.3A31.6 31.6 0 0 1 224.5 0a32 32 0 0 1 22.6 9.3l80.3 80.3 47.8-47.9a33.6 33.6 0 0 1 47.5 0l47.5 47.5a33.6 33.6 0 0 1 0 47.5l-47.8 47.9L502.7 265A31.8 31.8 0 0 1 502.6 310zM219.6 197.4l73.8-73.8-68.9-68.9-73.8 73.8zm237.7 90.1-68.9-68.9-73.8 73.8 68.9 68.9z"/></svg>'


async function initMap() {
  // Request libraries when needed, not in the script tag.
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
    "marker",
  );
  // Short namespaces can be used.
  map = new Map(document.getElementById("map"), {
    center: { lat: gps_coords_1[0].lat, lng: gps_coords_1[0].lng },
    zoom: 18,
    minZoom: 2,
    mapTypeId: BACKEND == "google" ? "roadmap" : "OSM",
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    scaleControl: false,
    rotateControl: false,
    gestureHandling: "none",
    clickableIcons: false,
    draggableCursor: "crosshair",
    mapId: "4504f8b37365c3d0"
  });
  //Define OSM map type pointing at the OpenStreetMap tile server
  map.mapTypes.set(
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
  );
}

function updateClickedLine() {
  if (clickedRoute) {
    clickedRoute.setMap(null);
  }
  clickedRoute = new google.maps.Polyline({
    path: clickedPoints,
    geodesic: true,
    strokeColor: "#0000FF",
    strokeWeight: 2,
    strokeOpacity: 0.5,
  });
  clickedRoute.setMap(map);
}

function addLocationToMap(lat, lng) {
  map.panTo( { lat: lat, lng: lng })
  const parser = new DOMParser()
  const satellite_svg = parser.parseFromString(
    satellite_svg_string,
      "image/svg+xml",
    ).documentElement;

  //const pinElement = new google.maps.marker.PinElement({
  //  borderColor: "#FFFFFF",
  //  scale: 0.5
  //});
  const markerViewBorder = new google.maps.marker.AdvancedMarkerElement({
    map,
    position: { lat: lat, lng: lng },
    content: satellite_svg,
  });

  clickedPoints.push({lat: lat, lng: lng})
  updateClickedLine();
  pubnub.publish({
    channel: channelName,
    message: {"provider": BACKEND, "points": clickedPoints.slice(Math.max(clickedPoints.length - 35, 0))}
  })
}

function updateVehicleRoute(snappedPoints) {
  if (drawnRoute) {
    drawnRoute.setMap(null);
  }
  var tempPath = []
  for (var i = 0; i < snappedPoints.length; i++) {
    tempPath.push({lat: snappedPoints[i].location.latitude, lng: snappedPoints[i].location.longitude})
  }
  drawnRoute = new google.maps.Polyline({
    path: tempPath,
    geodesic: true,
    strokeColor: "#CD2026",
    strokeWeight: 3,
    strokeOpacity: 0.7,
  });
  drawnRoute.setMap(map);

  const parser = new DOMParser()
  const truck_svg = parser.parseFromString(
    truck_svg_string,
      "image/svg+xml",
    ).documentElement;
  if (vehicleMarker) vehicleMarker.setMap(null);
  vehicleMarker = new google.maps.marker.AdvancedMarkerElement({
    map,
    position: { lat: tempPath[tempPath.length - 1].lat, lng: tempPath[tempPath.length - 1].lng },
    content: truck_svg,
    title: "Vehicle Location"
  });
  vehicleMarker.content.style.transform = 'translateY(55%)'
}

