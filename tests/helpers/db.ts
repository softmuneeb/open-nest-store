/**
 * Integration test helper — seeds/tears down in-memory MongoDB collections.
 * Uses the MONGODB_URI set by global-setup.ts (mongodb-memory-server).
 */
import { MongoClient, type Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import categoriesFixture from '../fixtures/categories.json';
import productsFixture from '../fixtures/products.json';
import usersFixture from '../fixtures/users.json';

let client: MongoClient;
let db: Db;

export async function connectTestDb(): Promise<Db> {
  client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  db = client.db(process.env.MONGODB_DB ?? 'opennest_test');
  return db;
}

export async function disconnectTestDb(): Promise<void> {
  if (client) await client.close();
}

export async function seedCategories(): Promise<void> {
  await db.collection('categories').deleteMany({});
  await db.collection('categories').insertMany(categoriesFixture as never[]);
}

export async function seedProducts(): Promise<void> {
  await db.collection('products').deleteMany({});
  await db.collection('products').insertMany(productsFixture as never[]);
  // Create text index for search
  await db.collection('products').createIndex(
    { name: 'text', description: 'text', sku: 'text', 'meta.keywords': 'text' },
    { name: 'products_text_search' }
  );
}

export async function seedUsers(): Promise<void> {
  await db.collection('users').deleteMany({});
  // Hash test passwords before inserting
  const usersWithHashes = await Promise.all(
    (usersFixture as Array<Record<string, unknown>>).map(async (user) => {
      const testPwd = user.test_password as string | undefined;
      if (testPwd) {
        const password_hash = await bcrypt.hash(testPwd, 8);
        const { test_password: _, ...rest } = user;
        return { ...rest, password_hash };
      }
      return user;
    })
  );
  await db.collection('users').insertMany(usersWithHashes as never[]);
}

export async function seedAll(): Promise<void> {
  await seedCategories();
  await seedProducts();
  await seedUsers();
  await seedCoupons();
}

export async function seedCoupons(): Promise<void> {
  await db.collection('coupons').deleteMany({});
  await db.collection('coupons').insertMany([
    {
      code: 'SAVE10',
      type: 'percent',
      value: 10,
      min_order_aed: 0,
      active: true,
      expires_at: null,
    },
    {
      code: 'FLAT50',
      type: 'fixed',
      value: 50,
      min_order_aed: 200,
      active: true,
      expires_at: null,
    },
    {
      code: 'EXPIRED2023',
      type: 'percent',
      value: 20,
      min_order_aed: 0,
      active: true,
      expires_at: '2023-12-31T23:59:59.000Z',
    },
  ] as never[]);
}

export async function clearAll(): Promise<void> {
  await db.collection('categories').deleteMany({});
  await db.collection('products').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('carts').deleteMany({});
  await db.collection('orders').deleteMany({});
  await db.collection('coupons').deleteMany({});
}

export { db };
