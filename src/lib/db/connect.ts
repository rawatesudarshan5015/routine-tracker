import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Don't throw errors during build time - only at runtime
// The MONGODB_URI will be available when the app actually runs

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!MONGODB_URI) {
    // Provide helpful error message at runtime
    console.error('MONGODB_URI is not defined. Set it in your environment variables.');
    throw new Error('MONGODB_URI is not defined. Set it in your environment variables.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
