import mongoose from 'mongoose';
import { DB_URI } from '../config.js';
import { connectRedis } from './redis.connection.js';

export const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('MongoDB connected successfully');
        await connectRedis();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
