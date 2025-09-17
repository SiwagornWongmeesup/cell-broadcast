import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectMongoDB = async () => {
  if (cached.conn) {
    return { client: cached.conn, db: cached.conn.db };
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URL)
      .then((mongoose) => {
        console.log("✅ Connected to MongoDB");
        return mongoose.connection;
      })
      .catch((err) => {
        console.error("❌ Error connecting to MongoDB:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return { client: cached.conn, db: cached.conn.db };
};
