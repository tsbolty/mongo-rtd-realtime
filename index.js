var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
const mongojs = require("mongojs")
const db = mongojs("rtd_underground_db", ["trip_update", "vehicle_position", "alerts"])

// HANDLE DB ERROR ON CONNECTION
db.on("error", error => {
  console.log("Database Error:", error);
});

// INSERTVALUES WILL BE ULTIMATELY BE THE ARRAY TO HOLD THE FINAL INSERT INTO THE VEHICLE_POSITION COLLECTION
let insertValues;

// SOURCE DATA
const vehiclePosition = 'https://www.rtd-denver.com/files/gtfs-rt/VehiclePosition.pb';
const tripUpdate = 'https://www.rtd-denver.com/files/gtfs-rt/TripUpdate.pb';
const alerts = 'https://www.rtd-denver.com/files/gtfs-rt/Alerts.pb';

// WILL RUN QUERIES AND SET DATABASE AT WHATEVER INTERVAL
// vehiclePositionData()
// alertData()
// setInterval(() => {
//   setTimeout(vehiclePositionData, 2000)
//   setTimeout(alertData, 2000)
// }, 30000)
grabValues()

// FUNCTION TO RETRIEVE ALERTS AND POST TO DB
function alertData() {
  const requestSettings = {
    method: 'GET',
    url: alerts,
    encoding: null
  };
  return request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      const alertValues = feed.entity.filter(entity => {
        if (entity) {
          return true
        }
      });
      // CLEARS OUT ALL DOCUMENTS BEFORE POSTING NEW DATA
      db.alerts.drop()
      // INSERTS ALL ALERTS TO ALERTS COLLECTION IN DB
      return db.alerts.insertMany(alertValues, (err, data) => {
        if (err) { console.log(err) }
        console.log("Inserted into alerts")
      })
    } else {
      console.log("Error requesting alert data")
    }
  })
}

// THIS FUNCTION WILL GET VEHICLE POSITION DATA, STORE ONLY TRAINS IN AN ARRAY, THEN GET TRIP UPDATE DATA FOR THOSE TRAINS AND POST IT TO THE DB
async function vehiclePositionData() {
  let requestSettings = {
    method: 'GET',
    url: vehiclePosition,
    encoding: null
  };
  await request(requestSettings, async function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      insertValues = feed.entity.filter(entity => entity.vehicle);        
    } else {
      console.log("Error requesting vehicle position data")
    }
  })
  requestSettings = {
    method: 'GET',
    url: tripUpdate,
    encoding: null
  };
  request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      // LOOPS THROUGH INSERTVALUES ARRAY AND ADDS TRIP UPDATE DATA TO THE OBJECT WITH THE SAME TRIPID NUMBER
      for (let i = 0; i < insertValues.length; i++) {
        for (data of feed.entity) {
          if (insertValues[i].vehicle.trip && data.tripUpdate.trip.tripId === insertValues[i].vehicle.trip.tripId) {
            insertValues[i].tripUpdate = data
          }
        }
      }
      // CLEARS ALL DOCUMENTS OUT OF COLLECTION BEFORE POSTING NEW DATA
      db.vehicle_position.drop()
      return db.vehicle_position.insertMany(insertValues, (err, data) => {
        if (err) { console.log(err) }
        console.log("inserted into vehicle_position")
      })
    }
    else {
      console.log("Error requesting trip update data")
    }
  })
}



function grabValues() {
  // THIS FUNCTION IS SET UP TO CONSOLE LOG SPECIFIC VALUES OF THE ARRAY. JUST CHANGE THE URL TO ANY ONE OF THE VARIABLES AND TWEAK THE CONSOLE.LOG/ MAP
  const requestSettings = {
    method: 'GET',
    url: 'https://www.rtd-denver.com/files/gtfs/google_transit.zip',
    encoding: null
  };
  return request(requestSettings, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
      feed.entity.map(entity => {
        if (entity) {
          console.log(entity)
        } else {
          console.log("none")
        }
      });
    } else {
      console.log(error)
    }
  });
}