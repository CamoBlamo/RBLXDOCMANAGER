import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is not defined. Add it to your .env.local file."
  );
}

let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development, cache the client promise on the global object so that
  // hot-reloading does not create a new connection pool on every reload.
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db("rblxdocmanager");
}
