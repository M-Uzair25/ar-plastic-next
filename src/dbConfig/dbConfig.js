import mongoose from "mongoose";
const connection = {};
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/AR_Plastic";

export const connectToDB = async () => {
    try {
        if (connection.isConnected) return;
        const db = await mongoose.connect(MONGO_URI);
        connection.isConnected = db.connections[0].readyState;
        console.log("MongoDB connected successfully.");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error(error);
    }
};
