var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
const mongojs = require("mongojs")

const db = mongojs("rtd_underground_db", ["trip_update", "vehicle_position", "alerts"])

db.on("error", error => {
  console.log("Database Error:", error);
});

const vehiclePosition = 'https://www.rtd-denver.com/files/gtfs-rt/VehiclePosition.pb';
const tripUpdate = 'https://www.rtd-denver.com/files/gtfs-rt/TripUpdate.pb';
const alerts = 'https://www.rtd-denver.com/files/gtfs-rt/Alerts.pb';

tripUpdateData()
vehiclePositionData()
alertData()
setInterval(()=>{
    setTimeout(tripUpdateData, 2000)
    setTimeout(vehiclePositionData, 2000)
    setTimeout(alertData, 2000)
}, 30000)
// grabValues()
  
function grabValues() {
  // THIS FUNCTION IS SET UP TO CONSOLE LOG SPECIFIC VALUES OF THE ARRAY. JUST CHANGE THE URL TO ANY ONE OF THE VARIABLES AND TWEAK THE CONSOLE.LOG/ MAP
  const requestSettings = {
    method: 'GET',
    url: vehiclePosition,
    encoding: null
  };
  return request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      feed.entity.map(entity => {
        if (entity.vehicle.vehicle.label.length < 4) {
          console.log(entity)
        } else {
          console.log("none")
        }
      });
    } else {
      console.log("Wrong path")
    }
  });
}

function tripUpdateData() {
  const requestSettings = {
    method: 'GET',
    url: tripUpdate,
    encoding: null
  };
  return request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      const insertValues = feed.entity.filter(entity => {
        if (entity) {
          return true
        }
      });
      return db.trip_update.insertMany(insertValues, (err, data) => {
        if (err) { console.log(err) }
        console.log("Inserted into trip_update")
      })
    } else {
      console.log("Wrong path")
    }
  });
}

function vehiclePositionData() {
  const requestSettings = {
    method: 'GET',
    url: vehiclePosition,
    encoding: null
  };
  return request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      const insertValues = feed.entity.filter(entity => {
        if (entity.vehicle && entity.vehicle.vehicle.label.length < 4) {
          return true
        }
      });
      return db.vehicle_position.insertMany(insertValues, (err, data) => {
        if (err) { console.log(err) }
        console.log("inserted into vehicle_position")
      })
    } else {
      console.log("Wrong path")
    }
  })
}

function alertData() {
  const requestSettings = {
    method: 'GET',
    url: alerts,
    encoding: null
  };
  return request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      const insertValues = feed.entity.filter(entity => {
        if (entity) {
          return true
        }
      });
      return db.alerts.insertMany(insertValues, (err, data) => {
        if (err) { console.log(err) }
        console.log("Inserted into alerts")
      })
    } else {
      console.log("Wrong path")
    }
  })
}