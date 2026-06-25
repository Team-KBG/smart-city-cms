import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)", transition: "background-color 0.3s ease" }}>
      <Navbar />
      <main style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "32px 24px 60px",
      }}>
        {children}
      </main>
    </div>
  );
}
