var pubnub = null;
var channelName = "";
var snappedPoints = [];
var drawnRoute = null;
var progress = 1;
var data;
var timerId = 0;

async function onload() {
  pubnub = await createPubNubObject();
  channelName = "loc." + pubnub.getUUID();

  data = gps_coords_1
  addLocationToMap(data[0].lat, data[0].lng)

  await pubnub.addListener({
    message: async (payload) => {
      if (payload.message && payload.message.snappedPoints)
      {
        updateVehicleRoute(payload.message.snappedPoints)
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

function startDemo()
{
  document.getElementById('btnStart').disabled = true;
  data = gps_coords_1
  processPoint(progress)
}

function stopDemo()
{
  document.getElementById('btnStart').disabled = false;
  clearTimeout(timerId);
}

function processPoint(iter)
{
  if (iter < data.length)
  {
    addLocationToMap(data[iter].lat, data[iter].lng)
    progress++
    timerId = setTimeout(processPoint, 1000, progress)
  }
}

