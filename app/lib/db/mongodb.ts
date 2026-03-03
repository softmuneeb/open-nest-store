import { MongoClient, type Db } from 'mongodb';

interface Env {
  MONGODB_URI: string;
  MONGODB_DB?: string;
}

/**
 * Module-level singleton. In Cloudflare Workers the module is isolated per isolate,
 * so this lives for the lifetime of a worker instance and is reused across requests.
 *
 * We store a *promise* (not just the resolved client) so that concurrent requests
 * that arrive before the first connection is established all await the same attempt
 * instead of each spawning a new MongoClient → prevents the EventEmitter
 * "N timeout listeners" memory-leak warning and avoids thundering-herd reconnects.
 */
let connectionPromise: Promise<MongoClient> | null = null;
let cachedUri: string | null = null;

function createClient(uri: string): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 8_000,
    socketTimeoutMS: 15_000,
    // Automatically close idle sockets so Atlas Free/Shared tier doesn't
    // drop connections while in dev.
    maxIdleTimeMS: 60_000,
  });

  const promise = client
    .connect()
    .then(() => client)
    .catch((err) => {
      // Clear so the next request retries from scratch.
      connectionPromise = null;
      cachedUri = null;
      throw err;
    });

  return promise;
}

export async function getMongoClient(env: Env): Promise<MongoClient> {
  if (!env?.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set. Add it to .dev.vars for local development.');
  }

  // If URI changed (e.g. env rotated) force a fresh connection.
  if (cachedUri !== env.MONGODB_URI) {
    connectionPromise = null;
    cachedUri = null;
  }

  if (!connectionPromise) {
    connectionPromise = createClient(env.MONGODB_URI);
    cachedUri = env.MONGODB_URI;
  }

  try {
    return await connectionPromise;
  } catch (err) {
    // createClient's .catch() already cleared the cache; just rethrow.
    throw err;
  }
}

export async function getDb(env: Env, dbName?: string): Promise<Db> {
  const client = await getMongoClient(env);
  return client.db(dbName ?? env.MONGODB_DB ?? 'opennest');
}
