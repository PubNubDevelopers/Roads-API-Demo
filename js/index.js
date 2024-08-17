var pubnub = null;
var channelName = "";
var snappedPoints = [];
var drawnRoute = null;

async function onload() {
  pubnub = await createPubNubObject();
  channelName = "loc." + pubnub.getUUID();

  await pubnub.addListener({
    message: async (payload) => {
      if (payload.message && payload.message.snappedPoints)
      {
        updateRoute(payload.message.snappedPoints)
      }
      else {
        console.log("Payload does not contain snapped points")
      }
    }
  });

  //  Wildcard subscribe, to listen for all devices in a scalable manner
  pubnub.subscribe({
    channels: ["loc.*"],
    withPresence: false,
  });
}

function updateRoute(snappedPoints) {
  if (drawnRoute) {
    drawnRoute.setMap(null);
  }
  var tempPath = []
  for (var i = 0; i < snappedPoints.length; i++) {
    tempPath.push({lat: snappedPoints[i].location.latitude, lng: snappedPoints[i].location.longitude})
  }
  console.log(tempPath)
  drawnRoute = new google.maps.Polyline({
    path: tempPath,
    geodesic: true,
    strokeColor: "#CD2026",
  });
  drawnRoute.setMap(map);
}
