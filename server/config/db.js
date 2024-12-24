import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`Database connected: ${conn.connection.host}`);  // Use 'connection' instead of 'Connection'
    } catch (error) {
        console.log(error);  // Log the error variable
    }
};

export default connectDB;
