"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./zustand/useAuthStore";

/* =========================
   BASE CONFIG (FIXED)
========================= */
axios.defaults.baseURL = process.env.NEXT_PUBLIC_AUTH_URL;
axios.defaults.withCredentials = true;

const Auth = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { updateAuthName } = useAuthStore();

  /* =========================
     SIGN UP
  ========================= */
  const signUpFunc = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/Auth/signup", {
        username,
        password,
      });

      if (res.data.message === "Username already exists") {
        alert("Username already exists");
        return;
      }

      updateAuthName(username);

      alert("Signup successful");

      setUsername("");
      setPassword("");

      router.replace("/chat");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  /* =========================
     LOGIN
  ========================= */
  const loginFunc = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/Auth/login", {
        username,
        password,
      });

      updateAuthName(res.data.username);

      alert("Login successful");

      setUsername("");
      setPassword("");

      router.replace("/chat");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>ChatVerse</h2>
        <p style={styles.subtitle}>Sign in or create account</p>

        <form style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />

          <div style={styles.buttonRow}>
            <button style={styles.signupBtn} onClick={signUpFunc}>
              Sign Up
            </button>

            <button style={styles.loginBtn} onClick={loginFunc}>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;

/* =========================
   STYLES (FIXED)
========================= */
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#F5EFE6",
  },

  card: {
    width: "380px",
    padding: "30px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "5px",
  },

  subtitle: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#777",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "bold",
  },

  input: {
    padding: "10px",
    border: "1px solid #ccc",   // ✅ FIXED HERE
    borderRadius: "6px",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  signupBtn: {
    flex: 1,
    padding: "10px",
    background: "#B8A58D",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  loginBtn: {
    flex: 1,
    padding: "10px",
    background: "#3E3E3E",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};