import { MongoClient, Db, MongoClientOptions } from 'mongodb';

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your MongoDB DATABASE_URL to .env.local');
}

const uri = process.env.DATABASE_URL;
const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  w: 'majority'
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve value across module reloads caused by HMR (Next.js).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production create new instance.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db('inboxflow');
}

// Export for legacy usage
export default clientPromise;
