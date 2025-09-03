import mongoose from 'mongoose'
import dotenv from 'dotenv';
dotenv.config();  // โหลดตัวแปรจาก .env


export const connectMongoDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Conected to MongoDB")
    }catch(error) {
        console.log("Error connecting to MongoDB: ",error);
    }

}