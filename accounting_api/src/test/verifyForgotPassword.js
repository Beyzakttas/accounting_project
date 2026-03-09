import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../Models/User.js';
import crypto from 'crypto';

dotenv.config();

const testVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'test@example.com';
        let user = await User.findOne({ email });

        if (!user) {
            console.log('Creating test user...');
            user = await User.create({
                fullname: 'Test User',
                email: email,
                password: 'Password123!',
                role: 'USER'
            });
        }

        console.log('1. Testing Forgot Password logic (manually)...');
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });
        console.log('Reset token saved to DB.');

        console.log('2. Testing Reset Password logic...');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const foundUser = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (foundUser) {
            console.log('User found with token!');
            foundUser.password = 'NewPassword123!';
            foundUser.resetPasswordToken = undefined;
            foundUser.resetPasswordExpires = undefined;
            await foundUser.save();
            console.log('Password updated successfully.');
        } else {
            console.error('FAILED: User not found with token.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

testVerification();
