import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import styles from "../styles/Home.module.css";

interface Submission {
  _id: string;
  name: string;
  employee_number: string;
  workshop_title: string;
  date: string;
  funnel_type: string;
  description: string;
  submitted_at: string;
}

const SubmissionsList: NextPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [previewQR, setPreviewQR] = useState<{
    url: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/get-submissions");
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
        generateQRCodes(data.submissions);
      } else {
        setError("Failed to fetch submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodes = async (submissionsList: Submission[]) => {
    const qrCodeMap: Record<string, string> = {};

    for (const submission of submissionsList) {
      try {
        const url = `${window.location.origin}/workshop/${submission._id}`;
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 100,
          margin: 1,
        });
        qrCodeMap[submission._id] = qrDataUrl;
      } catch (error) {
        console.error(`Error generating QR code for ${submission._id}:`, error);
      }
    }

    setQrCodes(qrCodeMap);
  };

  const handleQRClick = async (submission: Submission) => {
    try {
      const url = `${window.location.origin}/workshop/${submission._id}`;
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
      });
      setPreviewQR({
        url: qrDataUrl,
        name: submission.name,
      });
    } catch (error) {
      console.error("Error generating preview QR code:", error);
    }
  };

  const closePreview = () => {
    setPreviewQR(null);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Loading...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Workshop Submissions List</title>
        <meta name='description' content='List of all workshop submissions' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Workshop Submissions</h1>

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px",
              borderRadius: "4px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb",
            }}>
            {error}
          </div>
        )}

        {submissions.length === 0 ? (
          <p>No submissions found.</p>
        ) : (
          <div style={{ width: "100%", maxWidth: "1200px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "20px",
              }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}>
                    Name
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}>
                    Employee Number
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}>
                    Workshop Title
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}>
                    Date
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}>
                    Funnel Type
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}>
                    Submitted At
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}>
                    QR Code
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "left",
                    }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission._id}>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {submission.name}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {submission.employee_number}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {submission.workshop_title}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {new Date(submission.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          submission.funnel_type === "Awareness"
                            ? "bg-blue-100 text-blue-800"
                            : submission.funnel_type === "Engagement"
                            ? "bg-green-100 text-green-800"
                            : submission.funnel_type === "Conversion"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                        {submission.funnel_type}
                      </span>
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        border: "1px solid #ddd",
                        textAlign: "center",
                      }}>
                      {qrCodes[submission._id] && (
                        <img
                          src={qrCodes[submission._id]}
                          alt={`QR code for ${submission.name}`}
                          style={{
                            maxWidth: "120px",
                            height: "auto",
                            cursor: "pointer",
                            transition: "transform 0.2s ease",
                          }}
                          title='Click to preview larger QR code'
                          onClick={() => handleQRClick(submission)}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        />
                      )}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      <a
                        href={`/workshop/${submission._id}`}
                        style={{
                          color: "#0070f3",
                          textDecoration: "none",
                          padding: "5px 10px",
                          backgroundColor: "#f0f8ff",
                          borderRadius: "4px",
                          border: "1px solid #0070f3",
                        }}>
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <a
            href='/workshop-create'
            style={{ color: "#0070f3", textDecoration: "none" }}>
            Add New Workshop
          </a>
        </div>

        {/* QR Code Preview Modal */}
        {/* QR Code Preview Modal */}
        {previewQR && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={closePreview}>
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                width: "95%",
                maxWidth: "600px",
                margin: "10px",
                maxHeight: "90vh",
                overflow: "auto",
              }}
              onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>
                QR Code for {previewQR.name}
              </h3>
              <div
                style={{
                  width: "100%",
                  height: "auto",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <img
                  src={previewQR.url}
                  alt={`QR code preview for ${previewQR.name}`}
                  style={{
                    width: "100%",
                    maxWidth: "min(90vw, 90vh)",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
              <p style={{ margin: "20px 0", fontSize: "14px", color: "#666" }}>
                Scan this QR code to view the submission details
              </p>
              <button
                onClick={closePreview}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#0070f3",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#0051cc";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#0070f3";
                }}>
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubmissionsList;
