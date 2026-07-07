const mongoose = require('mongoose');
const uri = "mongodb+srv://crime_reporting:5T2jBV74p7OprPqr@crs.vqvtskb.mongodb.net/?appName=CRS";

console.log("Connecting...");
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("Connected successfully to Atlas!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Failed to connect:", err.message);
    process.exit(1);
  });
