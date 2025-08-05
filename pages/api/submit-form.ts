import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DATABASE_NAME = "workshop_submissions";
const COLLECTION_NAME = "workshops";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, employee_number, workshop_title, date, funnel_type, description } = req.body;

  // Validate required fields
  if (!name || !employee_number || !workshop_title || !date || !funnel_type || !description) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  // Validate funnel_type values
  const allowedFunnelTypes = ["Awareness", "Engagement", "Conversion"];
  if (!allowedFunnelTypes.includes(funnel_type)) {
    return res.status(400).json({
      error: "Invalid funnel type. Must be one of: Awareness, Engagement, Conversion",
    });
  }

  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    // console.log(MONGODB_URI)
    await client.connect();

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Create the submission document
    const submission = {
      name: name.trim(),
      employee_number: employee_number.trim(),
      workshop_title: workshop_title.trim(),
      date: new Date(date),
      funnel_type: funnel_type.trim(),
      description: description.trim(),
      submitted_at: new Date(),
      ip_address:
        req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    };

    // Insert the document
    const result = await collection.insertOne(submission);

    res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("MongoDB error:", error);
    res.status(500).json({
      error: "Failed to save submission to database",
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
