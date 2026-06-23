'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 }).then(async () => {
  // Use the raw collection to bypass Mongoose schema validators
  const db = mongoose.connection.db;
  const col = db.collection('complaints');

  // Find and fix complaints that have location.type but no location.coordinates
  // These were created during the bug window and break the 2dsphere index
  const result = await col.updateMany(
    { 'location.type': { $exists: true }, 'location.coordinates': { $exists: false } },
    { $unset: { location: '' } }
  );
  console.log('Fixed malformed location docs:', result.modifiedCount);

  // Also clean up the test complaints from the failed workflow run
  const del = await col.deleteMany({
    title: { $in: ['Broken Streetlight', 'Water Leakage'] },
    citizenEmail: { $in: ['guest@test.com', 'workflow_1782241927@test.com'] }
  });
  console.log('Cleaned up test docs:', del.deletedCount);

  await mongoose.disconnect();
  console.log('Done.');
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
