import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

const Submission: NextPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    employee_number: "",
    workshop_title: "",
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    funnel_type: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Form submitted successfully! Redirecting...");
        setFormData({
          name: "",
          employee_number: "",
          workshop_title: "",
          date: new Date().toISOString().split('T')[0],
          funnel_type: "",
          description: "",
        });
        // Redirect to submissions list after 2 seconds
        setTimeout(() => {
          router.push("/submissions-list");
        }, 2000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Workshop Submission Form</title>
        <meta
          name="description"
          content="Submit workshop participation details"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Workshop Submission Form</h1>
        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              borderRadius: "4px",
              backgroundColor: message.includes("Error")
                ? "#f8d7da"
                : "#d4edda",
              color: message.includes("Error") ? "#721c24" : "#155724",
              border: `1px solid ${message.includes("Error") ? "#f5c6cb" : "#c3e6cb"}`,
            }}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="employee_number">Employee Number:</label>
            <input
              type="text"
              id="employee_number"
              name="employee_number"
              value={formData.employee_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="workshop_title">Workshop Title:</label>
            <input
              type="text"
              id="workshop_title"
              name="workshop_title"
              value={formData.workshop_title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="funnel_type">Funnel Type:</label>
            <select
              id="funnel_type"
              name="funnel_type"
              value={formData.funnel_type}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Funnel Type</option>
              <option value="Awareness">Awareness</option>
              <option value="Engagement">Engagement</option>
              <option value="Conversion">Conversion</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={styles.generateButton}
          >
            {submitting ? "Submitting..." : "Submit Form"}
          </button>
        </form>

        <div style={{ marginTop: "20px" }}>
          <a href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
            ← Back to Certificate Generator
          </a>
        </div>
      </main>
    </div>
  );
};

export default Submission;
