import { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";
import styles from "../../styles/Admin.module.css";

interface Submission {
  _id: string;
  name: string;
  email: string;
  school: string;
  workshop_title: string;
  kelas: string;
  handphone: string;
  created_at: string;
}

const AdminSubmissions: NextPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setAdmin] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [kodeRahasia, setKodeRahasia] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/get-certificate");
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.certificates);
      } else {
        setError("Failed to fetch submissions");
      }
    } catch (error) {
      setError("Error loading submissions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setGenerating(true);
    try {
      const response = await fetch("/api/check-secretcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kodeRahasia: kodeRahasia,
        }),
      });

      if (response.ok) {
        setAdmin(true);
      } else {
        alert("Kode rahasia invalid");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin - Submissions</title>
        <meta
          name='description'
          content='Admin panel for workshop submissions'
        />
      </Head>

      <main className={styles.main}>
        {!isAdmin ? (
          <div>
            <h1 className={styles.title}>
              You are not authorized to access this page.
            </h1>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <input
                  type='text'
                  id='personName'
                  value={kodeRahasia}
                  onChange={(e) => setKodeRahasia(e.target.value)}
                  placeholder='Tulis kode rahasia'
                  required
                />
              </div>
              <button
                type='submit'
                disabled={generating}
                className={styles.generateButton}>
                {generating ? "validasi..." : "Submit"}
              </button>
            </form>
          </div>
        ) : (
          <>
            <h1 className={styles.title}>Workshop Submissions</h1>
            <div className={styles.grid}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Sekolah</th>
                    <th>Workshop</th>
                    <th>Kelas</th>
                    <th>Handphone</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id}>
                      <td>{submission.name}</td>
                      <td>{submission.email}</td>
                      <td>{submission.school}</td>
                      <td>{submission.workshop_title}</td>
                      <td>{submission.kelas}</td>
                      <td>{submission.handphone}</td>
                      <td>
                        {new Date(submission.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminSubmissions;
