import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const [user, setUser] = useState<any>({ name: "Permata" });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedId = localStorage.getItem("workshopId");
    if (storedId) {
      router.push(`/workshop/${storedId}`);
    }
    checkAuthStatus();
  }, []);

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
          <div>
            <p className={styles.description}>
              Please login with your Google account to generate certificates
            </p>
            <button onClick={handleLogin} className={styles.loginButton}>
              Login with Google
            </button>
          </div>
        ) : (
          <div className={styles.description}>
            <p>
              Hello, {user.name}! <br></br>Scan QRCode yang diberikan instruktur
              untuk mendapatkan E-Sertifikat berikut
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

const CertificateForm = ({ userEmail }: { userEmail: string }) => {
  const [personName, setPersonName] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [namaInstansi, setnamaInstansi] = useState("");
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
          namaInstansi: namaInstansi.trim(),
        }),
      });
      console.log(response);

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
      <div className={styles.formGroup}>
        <label htmlFor='workshopName'>Nama Sekolah:</label>
        <input
          type='text'
          id='workshopName'
          value={namaInstansi}
          onChange={(e) => setnamaInstansi(e.target.value)}
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

export default Home;
