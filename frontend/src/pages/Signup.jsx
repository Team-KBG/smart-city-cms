import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post(
        "/api/auth/register",
        {
          ...form,
          role: "citizen",
        }
      );

      login(data.user, data.token);

      navigate("/");
    } catch (err) {
      setMsg(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow">
      <h1 className="mb-6 text-3xl font-bold">
        Create Account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          className="w-full rounded-xl border px-4 py-3"
        />

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
          Sign Up
        </button>
      </form>

      {msg && (
        <p className="mt-4 text-sm text-red-600">
          {msg}
        </p>
      )}

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-600"
        >
          Login
        </Link>
      </p>
    </div>
  );
}