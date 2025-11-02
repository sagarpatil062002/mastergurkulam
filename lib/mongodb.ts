import { MongoClient, type Db, type Collection } from "mongodb"

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://sagarpatil062002_db_user:DIymNxxF7WS0UYjW@mastergurukulam.orcxtev.mongodb.net/?retryWrites=true&w=majority&appName=mastergurukulam"
const DB_NAME = "mastergurukulam"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
  })

  try {
    await client.connect()
    const db = client.db(DB_NAME)

    // Create indexes for better query performance
    await Promise.all([
      db.collection("courses").createIndex({ slug: 1 }),
      db.collection("exams").createIndex({ slug: 1 }),
      db.collection("exam_registrations").createIndex({ exam_id: 1, email: 1 }),
      db.collection("activities").createIndex({ createdAt: -1 }),
      db.collection("contacts").createIndex({ createdAt: -1 }),
    ]).catch(() => {}) // Ignore index creation errors if they already exist

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("MongoDB connection failed:", error)
    throw error
  }
}

export function getDatabase() {
  if (!cachedDb) {
    throw new Error("Database not connected. Call connectToDatabase() first.")
  }
  return cachedDb
}

export async function getCollection<T>(name: string): Promise<Collection<T>> {
  const { db } = await connectToDatabase()
  return db.collection<T>(name)
}
