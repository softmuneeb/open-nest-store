import { MongoClient, type Db } from 'mongodb';

interface Env {
  MONGODB_URI: string;
  MONGODB_DB?: string;
}

/**
 * Module-level singleton. In Cloudflare Workers the module is isolated per isolate,
 * so this lives for the lifetime of a worker instance and is reused across requests.
 */
let cachedClient: MongoClient | null = null;
let cachedUri: string | null = null;

export async function getMongoClient(env: Env): Promise<MongoClient> {
  if (!env?.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set. Add it to .dev.vars for local development.');
  }
  if (cachedClient && cachedUri === env.MONGODB_URI) {
    return cachedClient;
  }
  // Fail fast instead of hanging the Worker for 30 s when Atlas is unreachable.
  const client = new MongoClient(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 8_000,
    socketTimeoutMS: 10_000,
  });
  await client.connect();
  cachedClient = client;
  cachedUri = env.MONGODB_URI;
  return client;
}

export async function getDb(env: Env, dbName?: string): Promise<Db> {
  const client = await getMongoClient(env);
  return client.db(dbName ?? env.MONGODB_DB ?? 'opennest');
}
