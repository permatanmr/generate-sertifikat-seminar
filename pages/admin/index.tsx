import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import styles from '../../styles/Admin.module.css';

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

const AdminSubmissions: NextPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/get-submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (error) {
      setError('Error loading submissions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin - Submissions</title>
        <meta name="description" content="Admin panel for workshop submissions" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Workshop Submissions</h1>
        
        <div className={styles.grid}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee Number</th>
                <th>Workshop</th>
                <th>Date</th>
                <th>Funnel Type</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission._id}>
                  <td>{submission.name}</td>
                  <td>{submission.employee_number}</td>
                  <td>{submission.workshop_title}</td>
                  <td>{new Date(submission.date).toLocaleDateString()}</td>
                  <td>{submission.funnel_type}</td>
                  <td>{new Date(submission.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminSubmissions;