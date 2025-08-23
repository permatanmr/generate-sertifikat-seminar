import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { kodeRahasia } = req.body;

  // Validate required fields
  if (!kodeRahasia) {
    return res.status(400).json({
      error: "Kode Rahasia is required",
    });
  }

  if (kodeRahasia !== "STEMeroket!") {
    return res.status(400).json({
      error: "Kode Rahasia invalid",
    });
  }
  res.status(201).json({
    success: true,
    message: "Get code successfully",
  });
}
