const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const MONGODB_URI = "mongodb+srv://14eter_db_user:PWpnVTCduwVCI7iH@jobstivo.boa9muw.mongodb.net/";

async function fix() {
    console.log('--- DB FIX START ---');
    try {
        await mongoose.connect(MONGODB_URI);
        const UserSchema = new mongoose.Schema({ email: String, password: String, name: String }, { strict: false });
        const User = mongoose.model('User', UserSchema);
        
        const email = 'datruth14.vd@gmail.com';
        const password = 'Password123!';
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log('Target:', email);
        
        const user = await User.findOne({ email: email });
        if (!user) {
            console.log('User NOT found via email');
            process.exit(1);
        }

        console.log('Found user with ID:', user._id);
        
        // Update via Mongoose model
        user.password = hashedPassword;
        const saved = await user.save();
        console.log('Mongoose Save Success:', !!saved.password);

        // Update via raw collection just in case
        const rawResult = await mongoose.connection.db.collection('users').updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );
        console.log('Raw Update Result:', rawResult);

        // Critical Verification
        const verified = await mongoose.connection.db.collection('users').findOne({ _id: user._id });
        console.log('FINAL VERIFICATION - ID:', verified._id, 'Password present:', !!verified.password);
        
        if (verified.password) {
            console.log('SUCCESS: PASSWORD SET');
        } else {
            console.log('FAILURE: PASSWORD STILL MISSING');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}
fix();
