const mongojs = require("mongojs")

const db = mongojs("rtd_underground_db", ["trip_update", "vehicle_position", "alerts"])

db.on("error", error => {
  console.log("Database Error:", error);
});

db.trip_update.find({where: {label: 32}}, (err, data)=>{
  if (err) {console.log(err)}
  console.log(data)
})