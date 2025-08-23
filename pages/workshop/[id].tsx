import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "../../styles/Home.module.css";
import GoogleLogo from "./google-logo";
import { useRouter } from "next/router";
import Image from "next/image";

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
const Workshop: NextPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [workshop, setSubmission] = useState<Submission | null>(null);
  const router = useRouter();
  const { id } = router.query;
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchSubmission();
      localStorage.setItem("workshopId", id as string);
    }
    checkAuthStatus();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/get-submission/${id}`);
      if (response.ok) {
        const data = await response.json();
        // console.log("Fetched submission data:", data);
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
  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  const handleLogout = async () => {
    localStorage.removeItem("workshopId");
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
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
        <title>Certificate Generator</title>
        <meta
          name='description'
          content='Generate certificates of participation'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        {!user ? (
          <div className={styles.description}>
            <p className={styles.smalltext}>
              Login untuk mendapatkan E-Sertifikat <br></br>
              <b>{workshop && workshop.workshop_title}</b>
            </p>
            <div className={styles.logoContainer}>
              <Image
                src='/sertifikat.png'
                alt='sertifikat'
                width={300}
                height={200}
                priority
              />
            </div>
            <button onClick={handleLogin} className={styles.loginButton}>
              <GoogleLogo />
              Login with Google
            </button>
          </div>
        ) : (
          <div className={styles.description}>
            <p>
              Hi, {user.name}! <br></br>
              Dapatkan <b>E-Sertifikat</b> {workshop && workshop.workshop_title}
            </p>
            <div className={styles.logoContainer}>
              <Image
                src='/sertifikat.png'
                alt='sertifikat'
                width={300}
                height={200}
                priority
              />
            </div>
            <CertificateForm workshop={workshop} userEmail={user.email} />
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const CertificateForm = ({
  workshop,
  userEmail,
}: {
  workshop: any;
  userEmail: string;
}) => {
  const [personName, setPersonName] = useState("");
  const [namaInstansi, setnamaInstansi] = useState("");
  const [kelas, setKelas] = useState("");
  const [handphone, setHandphone] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !namaInstansi.trim()) {
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
          workshopName: workshop.workshop_title,
          namaInstansi: namaInstansi.trim(),
          kelas: kelas.trim(),
          handphone: handphone.trim(),
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

        // save the certificate to the database
        const formData = {
          name: personName.trim(),
          email: userEmail,
          school: namaInstansi.trim(),
          workshop: workshop.workshop_title,
        };
        try {
          const response = await fetch("/api/submit-certificate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
        } catch (error) {
          console.error("Error submitting certificate:", error);
        }
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
    <div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <input
            type='text'
            id='personName'
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder='Tulis nama lengkap Anda'
            required
          />
        </div>

        <div className={styles.formGroup}>
          <input
            type='text'
            id='schoolName'
            value={namaInstansi}
            onChange={(e) => setnamaInstansi(e.target.value)}
            placeholder='Tulis asal sekolah / Instansi'
            required
          />
        </div>
        <div className={styles.formGroup}>
          <input
            type='text'
            id='kelas'
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            placeholder='Tulis kelas / jabatan'
            required
          />
        </div>
        <div className={styles.formGroup}>
          <input
            type='text'
            id='handphone'
            value={handphone}
            onChange={(e) => setHandphone(e.target.value)}
            placeholder='Tulis nomor handphone'
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
    </div>
  );
};

export default Workshop;
