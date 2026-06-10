const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ParkingSlot = require('./models/ParkingSlot');

dotenv.config();

const slots = [
  { slotNumber: 'A1', type: 'car', floor: 1, zone: 'Zone A', pricePerHour: 10 },
  { slotNumber: 'A2', type: 'car', floor: 1, zone: 'Zone A', pricePerHour: 10 },
  { slotNumber: 'A3', type: 'vip', floor: 1, zone: 'Zone A', pricePerHour: 25 },
  { slotNumber: 'B1', type: 'bike', floor: 1, zone: 'Zone B', pricePerHour: 5 },
  { slotNumber: 'B2', type: 'bike', floor: 1, zone: 'Zone B', pricePerHour: 5 },
  { slotNumber: 'C1', type: 'ev', floor: 2, zone: 'Zone C', pricePerHour: 15 },
  { slotNumber: 'C2', type: 'ev', floor: 2, zone: 'Zone C', pricePerHour: 15 },
  { slotNumber: 'D1', type: 'car', floor: 2, zone: 'Zone D', pricePerHour: 12 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await ParkingSlot.deleteMany();
    console.log('Cleared existing slots');

    await ParkingSlot.insertMany(slots);
    console.log('Seeded initial slots');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
