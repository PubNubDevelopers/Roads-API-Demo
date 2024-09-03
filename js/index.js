var pubnub = null;
var channelName = "";
var snappedPoints = [];
var drawnRoute = null;
var progress = 1;
var data;
var timerId = 0;
var BACKEND = "google"


async function onload() {
  pubnub = await createPubNubObject();
  channelName = "loc." + pubnub.getUUID();

  data = gps_coords_1
  addLocationToMap(data[0].lat, data[0].lng)

  await pubnub.addListener({
    message: async (payload) => {
      if (payload.message && payload.message.snappedPoints)
      {
        //console.log(payload.message.snappedPoints)
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
  disableDirectionsProviderRadios(true)
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

async function directionsProviderChanged(ev)
{
  if (ev.dataset.opt == "google")
  {
    //  Change to Google logic
    BACKEND = "google"
    await initMap()
  }
  else if (ev.dataset.opt == "mapbox")
  {
    //  Change to Mapbox logic
    BACKEND = "mapbox"
    await initMap()
  }
  addLocationToMap(data[0].lat, data[0].lng)
}

function disableDirectionsProviderRadios(shouldDisable)
{
  document.getElementById('radio-google').disabled = shouldDisable
  document.getElementById('radio-mapbox').disabled = shouldDisable
}
