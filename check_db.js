const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://14eter_db_user:PWpnVTCduwVCI7iH@jobstivo.boa9muw.mongodb.net/";

async function check() {
    console.log('Connecting to MongoDB...');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const usersColl = db.collection('users');
        const users = await usersColl.find({}).toArray();
        
        console.log('--- User Records ---');
        users.forEach(u => {
            console.log(`ID: ${u._id} | Email: [${u.email}] | Password: ${u.password ? 'YES' : 'NO'} | Name: ${u.name}`);
        });

        await mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('CRITICAL ERROR:', err);
        process.exit(1);
    }
}

check();
