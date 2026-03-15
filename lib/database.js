import mongoose from 'mongoose';

// Use a global cache to survive across hot reloads in dev and serverless cold starts in prod
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const CONNECTION_OPTIONS = {
  maxPoolSize: 10,       // Up to 10 concurrent DB operations
  minPoolSize: 2,        // Keep 2 connections warm
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  bufferCommands: false, // Fail fast instead of buffering when disconnected
};

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, CONNECTION_OPTIONS)
      .then((m) => m.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Allow retry on next call
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};
