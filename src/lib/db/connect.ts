import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Allow builds without MONGODB_URI (for build-time only)
if (!MONGODB_URI && process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
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
