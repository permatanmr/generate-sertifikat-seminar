
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";

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

  const { wname } = req.query;

  if (!wname || typeof wname !== "string") {
    return res.status(400).json({ error: "Invalid submission ID" });
  }

  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    console.log("Workshop Name:", wname);

    // Fetch the submission by ID
    const submission = await collection.find({workshop_title: wname}).toArray();

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.status(200).json({
      success: true,
      submission: submission,
    });
  } catch (error) {
    console.error("MongoDB error:", error);
    res.status(500).json({
      error: "Failed to fetch certificate from database",
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
