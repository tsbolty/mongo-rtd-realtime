// THIS FILE IS MEANT TO QUERY THE DATABASE FOR INFORMATION TO TEST READ CAPABILITIES

const mongojs = require("mongojs")

const db = mongojs("rtd_underground_db", ["trip_update", "vehicle_position", "alerts"])

db.on("error", error => {
  console.log("Database Error:", error);
});

// TWEAK THIS FIND STATEMENT TO GET DIFFERENT VALUES
db.vehicle_position.find({}, (err, data)=>{
  if (err) {console.log(err)}
  console.log(data)
})