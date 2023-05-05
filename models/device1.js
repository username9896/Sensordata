const mongoose = require('mongoose');

module.exports = mongoose.model('Device', new mongoose.Schema({
    data: String,
    date: String,
    loadcelldata: String
}, { collection: 'sensor-data' }));