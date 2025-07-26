import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(Array.isArray(data) ? data : []);
      } else {
        console.error("Error fetching tickets:", data.message);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        toast.success("✅ Ticket created successfully");
        await fetchTickets();
      } else {
        toast.error(data.message || "Ticket creation failed");
      }
    } catch (err) {
      toast.error("❌ Error creating ticket");
      console.error("❌ Ticket creation error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this ticket?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}api/tickets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setTickets((prev) => prev.filter((ticket) => ticket._id !== id));
        toast.success("🗑️ Ticket deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete ticket");
      }
    } catch (err) {
      console.error("Error deleting ticket:", err);
      toast.error("❌ Failed to delete ticket");
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto text-gray-800 dark:text-white">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2 text-blue-600 dark:text-blue-400">
          🎫 Submit a Support Ticket
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Describe your issue and we'll help you out as soon as possible.
        </p>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-xl p-6 md:p-8 space-y-6 mb-16"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter a short title"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="5"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-200 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      {/* Tickets Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-blue-600 dark:text-blue-400">
          📋 Your Tickets
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-lg transition duration-200"
            >
              <Link to={`/tickets/${ticket._id}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {ticket.title}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {ticket.description.length > 100
                    ? ticket.description.slice(0, 100) + "..."
                    : ticket.description}
                </p>
                <p className="text-xs text-gray-500">
                  Created on:{" "}
                  <span className="font-medium">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </p>
              </Link>

              {/* ✅ Delete button */}
              <button
                onClick={() => handleDelete(ticket._id)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-sm"
                title="Delete ticket"
              >
                Delete🗑️
              </button>
            </div>
          ))}
        </div>

        {tickets.length === 0 && (
          <p className="mt-6 text-gray-600 dark:text-gray-400">
            No tickets submitted yet.
          </p>
        )}
      </div>

      {/* ✅ Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
