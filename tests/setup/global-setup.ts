/**
 * Global test setup — runs once before all test suites.
 * Starts and stops mongodb-memory-server.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export async function setup() {
  // Start in-memory MongoDB for integration tests
  mongod = await MongoMemoryServer.create({
    instance: { dbName: 'opennest_test' },
  });
  process.env.MONGODB_URI = mongod.getUri();
  process.env.MONGODB_DB = 'opennest_test';
  process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long!!';
}

export async function teardown() {
  if (mongod) {
    await mongod.stop();
  }
}
