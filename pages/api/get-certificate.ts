
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DATABASE_NAME = "workshop_submissions";
const COLLECTION_NAME = "certificates";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let client;

  try {
    // Connect to MongoDB
    // console.log(MONGODB_URI);
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    // console.log(collection);

    // Fetch all submissions, sorted by submission date (newest first)
    const certificates = await collection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      certificates: certificates,
    });
  } catch (error) {
    console.error("MongoDB error:", error);
    res.status(500).json({
      error: "Failed to fetch submissions from database",
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
