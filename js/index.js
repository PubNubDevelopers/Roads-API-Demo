var pubnub = null;
var channelName = "";
var snappedPoints = [];
var drawnRoute = null;

async function onload() {
  pubnub = await createPubNubObject();
  channelName = "loc." + pubnub.getUUID();

  await pubnub.addListener({
    signal: async (payload) => {
      snappedPoints.push({
        lat: payload.message.lat,
        lng: payload.message.lng,
      });
      updateRoute();
    },
  });

  //  Wildcard subscribe, to listen for all devices in a scalable manner
  pubnub.subscribe({
    channels: ["loc.*"],
    withPresence: false,
  });
}

function updateRoute() {
  if (drawnRoute) {
    drawnRoute.setMap(null);
  }
  drawnRoute = new google.maps.Polyline({
    path: snappedPoints,
    geodesic: true,
    strokeColor: "#CD2026",
  });
  drawnRoute.setMap(map);
}
