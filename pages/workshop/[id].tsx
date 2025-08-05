import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import QRCode from "qrcode";
import styles from "../../styles/Home.module.css";
import GoogleLogo from "./google-logo";

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

const WorkshopDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<any>(null);
  const [workshop, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

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

  if (error || !workshop) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Error</h1>
          <p>{error}</p>
        </main>
      </div>
    );
  }
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Sertifikat STEM</title>
        <meta
          name='description'
          content='Generate certificates of participation'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Dapatkan E-Sertifikat</h1>

        {!user ? (
          <div>
            <p className={styles.description}>
              Please login with your Google account to generate certificates
            </p>
            <div className={styles.description}>
              <button onClick={handleLogin} className={styles.loginButton}>
                <GoogleLogo />
                Login with Google
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className={styles.description}>
              Welcome, {user.name}! Generate your certificate below.
            </p>
            <CertificateForm userEmail={user.email} />
          </div>
        )}
      </main>
    </div>
  );
};

const CertificateForm = ({ userEmail }: { userEmail: string }) => {
  const [personName, setPersonName] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !workshopName.trim()) {
      alert("Please fill in both fields");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/generate-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personName: personName.trim(),
          workshopName: workshopName.trim(),
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificate-${personName.replace(/\s+/g, "-")}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to generate certificate");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor='personName'>Person Name:</label>
        <input
          type='text'
          id='personName'
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder='Enter participant name'
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor='workshopName'>Workshop Name:</label>
        <input
          type='text'
          id='workshopName'
          value={workshopName}
          onChange={(e) => setWorkshopName(e.target.value)}
          placeholder='Enter workshop name'
          required
        />
      </div>

      <button
        type='submit'
        disabled={generating}
        className={styles.generateButton}>
        {generating ? "Generating..." : "Generate Certificate"}
      </button>
    </form>
  );
};

export default WorkshopDetail;
