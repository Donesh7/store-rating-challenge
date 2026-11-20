import React from "react";

export default function AuthLayout({
  signup,
  error,
  notice,
  busy,
  authenticate,
  setSignup,
  setError,
  children,
}) {
  return (
    <div className="auth-layout">
      <section className="auth-story">
        <a className="brand" href="/">
          ◈ Storefront
        </a>
        <div>
          <span className="eyebrow">GOOD PLACES. REAL EXPERIENCES.</span>
          <h1>
            Your neighbourhood,
            <br />
            well recommended.
          </h1>
          <p>
            Find your next favourite store.
            <br />
            Share a little local knowledge.
          </p>
          <div className="rating-art">
            <span>★★★★★</span>
            <strong>A community built on trust.</strong>
            <small>Every rating starts with you.</small>
          </div>
        </div>
        <small>Discover local. Rate honestly.</small>
      </section>
      <main className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">WELCOME TO STOREFRONT</span>
          <h2>{signup ? "Join the community" : "Good to see you again."}</h2>
          <p className="muted">
            {signup
              ? "Create an account to discover and rate stores."
              : "One account. Your own corner of the community."}
          </p>
          {error && (
            <div role="alert" className="error">
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className="notice">
              {notice}
            </div>
          )}
          <form onSubmit={authenticate}>
            {children}
            <button className="primary" disabled={busy}>
              {busy ? "Please wait…" : signup ? "Create account" : "Sign in →"}
            </button>
          </form>
          <p className="muted">
            {signup ? "Already a member?" : "New around here?"}{" "}
            <button
              className="link"
              onClick={() => {
                setSignup(!signup);
                setError("");
              }}
            >
              {signup ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
