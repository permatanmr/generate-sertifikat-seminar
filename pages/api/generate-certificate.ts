import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session } = req.cookies;
  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    jwt.verify(session, process.env.JWT_SECRET || "fallback-secret");
  } catch (error) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const { personName, workshopName } = req.body;

  if (!personName || !workshopName) {
    return res
      .status(400)
      .json({ error: "Person name and workshop name are required" });
  }

  try {
    // Create PDF certificate
    const doc = new jsPDF("landscape", "pt", "a4");

    // Add STEM logo
    try {
      const logoPath = path.join(process.cwd(), "pages", "api", "stem-resized.png");
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString("base64");
      const logoDataUri = `data:image/jpeg;base64,${logoBase64}`;

      // Add logo to top center
      doc.addImage(
        logoDataUri,
        "PNG",
        doc.internal.pageSize.width / 2 - 150,
        90,
        250,
        70,
      );
    } catch (logoError) {
      console.error("Failed to load STEM logo:", logoError);
    }

    // Certificate border
    doc.setLineWidth(10);
    doc.setDrawColor(200, 0, 0);
    doc.rect(
      50,
      50,
      doc.internal.pageSize.width - 100,
      doc.internal.pageSize.height - 100,
    );

    // Inner border
    doc.setLineWidth(2);
    doc.setDrawColor(240, 0, 0);
    doc.rect(
      70,
      70,
      doc.internal.pageSize.width - 140,
      doc.internal.pageSize.height - 140,
    );

    // Title
    doc.setFontSize(36);
    doc.setTextColor(150, 0, 0);
    doc.text(
      "CERTIFICATE OF PARTICIPATION",
      doc.internal.pageSize.width / 2,
      220,
      { align: "center" },
    );

    // Subtitle
    doc.setFontSize(18);
    doc.setTextColor(100, 100, 100);
    doc.text("This is to certify that", doc.internal.pageSize.width / 2, 250, {
      align: "center",
    });

    // Participant name
    doc.setFontSize(32);
    doc.setTextColor(150, 0, 0);
    doc.text(personName, doc.internal.pageSize.width / 2, 300, {
      align: "center",
    });

    // Participation text
    doc.setFontSize(18);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "has successfully participated in",
      doc.internal.pageSize.width / 2,
      330,
      { align: "center" },
    );

    // Workshop name
    doc.setFontSize(28);
    doc.setTextColor(150, 0, 0);
    doc.text(workshopName, doc.internal.pageSize.width / 2, 370, {
      align: "center",
    });

    // Appreciation text
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "We appreciate your dedication and commitment to learning.",
      doc.internal.pageSize.width / 2,
      400,
      { align: "center" },
    );

    // Date
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFontSize(14);
    doc.text(`${currentDate}`, 100, doc.internal.pageSize.height - 100);

    // Add Dean Signature
    try {
      const logoPath = path.join(process.cwd(), "pages", "api", "ttd-resized.png");
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString("base64");
      const logoDataUri = `data:image/jpeg;base64,${logoBase64}`;

      // Add logo to top center
      doc.addImage(
        logoDataUri,
        "PNG",
        doc.internal.pageSize.width - 230,
        doc.internal.pageSize.height - 190,
        120,
        80,
      );
    } catch (logoError) {
      console.error("Failed to load STEM logo:", logoError);
    }

    // Signature line
    doc.setLineWidth(1);
    doc.setDrawColor(0, 0, 0);
    doc.line(
      doc.internal.pageSize.width - 250,
      doc.internal.pageSize.height - 120,
      doc.internal.pageSize.width - 100,
      doc.internal.pageSize.height - 120,
    );
    doc.text(
      "Dekan Fakultas STEM",
      doc.internal.pageSize.width - 175,
      doc.internal.pageSize.height - 100,
      { align: "center" },
    );

    // Generate PDF buffer more efficiently
    const pdfBuffer = doc.output();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${personName.replace(/\s+/g, "-")}.pdf"`,
    );
    res.end(pdfBuffer, "binary");
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
}
