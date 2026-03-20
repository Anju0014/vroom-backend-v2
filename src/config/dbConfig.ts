import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`, {
      dbName: 'Vroom',
    });
    console.log('mongodb connected');
  } catch (error) {
    console.log('error when connected db', error);
  }
};

export default connectDB;
