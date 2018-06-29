const mongoose = require('mongoose');

// if already we have a connection, don't connect to database again
// if (connectionInstance) {
//     module.exports = connectionInstance;
// 	return;
// }

const connectionInstance  = mongoose.createConnection('mongodb://localhost:27017/wizni');

connectionInstance.on('error', (err) => {
    if (err) {
        throw err;
    }
});

connectionInstance.once('open', () => {
    console.log(`MongoDb connected successfully, date is = ${new Date()}`);
});

module.exports = connectionInstance;

const logDebug = true;
mongoose.set('debug', logDebug);