import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DATABASE_NAME = "workshop_submissions";
const COLLECTION_NAME = "students";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }


  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Create the submission document
    const data = {
      name: name.trim(),
      email: email.trim(),
      created_at: new Date()
    };

    // Insert the document
    const result = await collection.insertOne(data);

    res.status(201).json({
      success: true,
      message: "user created successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("MongoDB error:", error);
    res.status(500).json({
      error: "Failed to save data to database",
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
