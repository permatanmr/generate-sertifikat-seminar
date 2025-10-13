
import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import QRCode from "qrcode";
import styles from "../../styles/Home.module.css";
import Link from "next/link";

interface Submission {
  _id: string;
  name: string;
  employee_number: string;
  workshop_title: string;
  date: string;
  funnel_type: string;
  description: string;
  submitted_at: string;
  ip_address?: string;
}

const SubmissionDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (id) {
      fetchSubmission();
      generateQRCode();
    }
  }, [id]);

  const generateQRCode = async () => {
    try {
      const currentUrl = `${window.location.origin}/submission-detail/${id}`;
      const qrDataUrl = await QRCode.toDataURL(currentUrl, {
        width: 200,
        margin: 2,
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/get-submission/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSubmission(data.submission);
      } else {
        setError("Submission not found");
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      setError("Failed to fetch submission");
    } finally {
      setLoading(false);
    }
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

  if (error || !submission) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Error</h1>
          <p>{error}</p>
          <div style={{ marginTop: "20px" }}>
            <a href="/submissions-list" style={{ color: "#0070f3", textDecoration: "none" }}>
              ← Back to Submissions List
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Submission Detail - {submission.name}</title>
        <meta name="description" content="Workshop submission details" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Submission Details</h1>
        
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            backgroundColor: "#f8f9fa",
            padding: "30px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Participant Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "10px", marginBottom: "20px" }}>
              <strong>Name:</strong>
              <span>{submission.name}</span>
              <strong>Employee Number:</strong>
              <span>{submission.employee_number}</span>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Workshop Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "10px", marginBottom: "20px" }}>
              <strong>Workshop Title:</strong>
              <span>{submission.workshop_title}</span>
              <strong>Workshop Date:</strong>
              <span>{new Date(submission.date).toLocaleDateString()}</span>
              <strong>Funnel Type:</strong>
              <span className={`px-2 py-1 rounded text-sm ${
                submission.funnel_type === 'Awareness' ? 'bg-blue-100 text-blue-800' :
                submission.funnel_type === 'Engagement' ? 'bg-green-100 text-green-800' :
                submission.funnel_type === 'Conversion' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {submission.funnel_type}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Description</h3>
            <div
              style={{
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                minHeight: "100px",
                whiteSpace: "pre-wrap",
              }}
            >
              {submission.description}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Submission Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "10px" }}>
              <strong>Submitted At:</strong>
              <span>{new Date(submission.submitted_at).toLocaleString()}</span>
              <strong>Submission ID:</strong>
              <span style={{ fontFamily: "monospace", fontSize: "14px" }}>{submission._id}</span>
            </div>
          </div>

          {qrCodeUrl && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 15px 0", color: "#333" }}>Share this Submission</h3>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  display: "inline-block",
                }}
              >
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code for this submission"
                  style={{ display: "block", margin: "0 auto" }}
                />
                <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#666" }}>
                  Scan to view this submission
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: "30px" }}>
          <Link
            href="/submissions-list"
            style={{
              color: "#0070f3",
              textDecoration: "none",
              marginRight: "20px",
              padding: "10px 20px",
              backgroundColor: "#f0f8ff",
              borderRadius: "4px",
              border: "1px solid #0070f3",
            }}
          >
            ← Back to Submissions List
          </Link>
          <Link
            href="/"
            style={{
              color: "#0070f3",
              textDecoration: "none",
              padding: "10px 20px",
              backgroundColor: "#f0f8ff",
              borderRadius: "4px",
              border: "1px solid #0070f3",
            }}
          >
            Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SubmissionDetail;
