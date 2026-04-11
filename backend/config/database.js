import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI must be provided in environment variables.");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected successfully.");
};
