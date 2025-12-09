import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is not set. Please add it to your .env file (e.g. MONGODB_URI=mongodb+srv://...)",
  );
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise!;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getMongoDb() {
  const connectedClient = await clientPromise!;
  // Default DB name: mash-fun-jersey-number-free-play (can be overridden via env)
  const dbName =
    process.env.MONGODB_DB || "mash-fun-jersey-number-free-play";
  return connectedClient.db(dbName);
}


