import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("DB Connected ✅");
  } catch (error) {
    console.log("DB Connection Failed ❌", error.message);
  }
};

export default connectDB;