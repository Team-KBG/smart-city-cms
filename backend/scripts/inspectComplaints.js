'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 }).then(async () => {
  const db = mongoose.connection.db;
  const col = db.collection('complaints');

  // Inspect all complaints to find malformed ones
  const all = await col.find({}).project({ complaintId: 1, location: 1, title: 1 }).toArray();
  console.log('All complaints in DB:');
  all.forEach(c => {
    const hasBadLocation = c.location && c.location.type && (!c.location.coordinates || c.location.coordinates.length === 0);
    console.log(`  ${c.complaintId} | title: ${c.title} | location: ${JSON.stringify(c.location)} | BAD: ${hasBadLocation}`);
  });

  // Fix any with location.type but missing/empty coordinates
  const badIds = all
    .filter(c => c.location && c.location.type && (!c.location.coordinates || c.location.coordinates.length === 0))
    .map(c => c._id);

  if (badIds.length > 0) {
    console.log(`\nFixing ${badIds.length} malformed docs...`);
    const r = await col.updateMany(
      { _id: { $in: badIds } },
      { $unset: { location: '' } }
    );
    console.log('Fixed:', r.modifiedCount);
  } else {
    console.log('\nNo malformed location docs found.');
  }

  await mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
