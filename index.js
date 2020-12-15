var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
const mongojs = require("mongojs")

const db = mongojs("rtd_underground_db", ["live_data"])

db.on("error", error => {
  console.log("Database Error:", error);
});

db.live_data.insert({ word: "hello" })

const vehiclePosition = 'https://www.rtd-denver.com/files/gtfs-rt/VehiclePosition.pb';
const tripUpdate = 'https://www.rtd-denver.com/files/gtfs-rt/TripUpdate.pb';
const alerts = 'https://www.rtd-denver.com/files/gtfs-rt/Alerts.pb';

const requestSettings = {
  method: 'GET',
  url: tripUpdate,
  encoding: null
};
//DID NOT INCLUDE DIRECTION_ID OR TIMESTAMP. ALL OTHER INFO IS DONE.

// grabValues()

function grabValues() {
  return request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);

      feed.entity.map(entity => {
        if (entity) {
          console.log(entity)
        }
      });
      process.exit()
    } else {
      console.log("Wrong path")
    }
  });
}

function tripUpdateData() {
  return request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      const rowData = feed.entity.map(entity => {
        if (entity) {

        } else {
          console.log("nope")
        }
      });
    }
  })
}

function vehiclePositionData() {
  return request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      const rowData = feed.entity.map(entity => {
        if (entity) {

        } else {
          console.log("nope")
        }
      });
    }
  })
}