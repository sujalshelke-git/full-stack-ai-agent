import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
        await fetchTickets();
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error("❌ Ticket creation error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-gray-800 dark:text-white">
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2 text-blue-600 dark:text-blue-400">
          🎫 Create a Support Ticket
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Let us know what issue you're facing.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-5 mb-12"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Unable to connect MongoDB"
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
            placeholder="Describe your issue clearly..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="4"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
          📋 Your Tickets
        </h2>

        <div className="grid sm:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              to={`/tickets/${ticket._id}`}
              className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-5"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {ticket.title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {ticket.description.length > 80
                  ? ticket.description.slice(0, 80) + "..."
                  : ticket.description}
              </p>
              <p className="text-xs text-gray-500">
                Created: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>

        {tickets.length === 0 && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            No tickets submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}
