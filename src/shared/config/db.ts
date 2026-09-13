import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tomsom-bridge-turf';
     await mongoose.connect(mongoUri);
    console.log(`DB connected`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Database connection error: ${error.message}`);
    } else {
      console.error('An unknown error occurred during database connection');
    }
    process.exit(1);
  }
};

export default connectDB;