import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/api/auth/login", form);

      login(data.user, data.token);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow">
      <h1 className="mb-6 text-3xl font-bold">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="w-full rounded-xl border px-4 py-3"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-3 text-white"
        >
          Login
        </button>
      </form>

      {msg && (
        <p className="mt-4 text-sm text-red-600">
          {msg}
        </p>
      )}

      <p className="mt-4 text-sm">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-blue-600"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}