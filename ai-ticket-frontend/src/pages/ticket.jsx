import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}api/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setTicket(data.ticket);
        } else {
          alert(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading)
    return <div className="text-center mt-10 text-gray-600">Loading ticket details...</div>;
  if (!ticket)
    return <div className="text-center mt-10 text-red-500">Ticket not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          🎟️ Ticket Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          View full information about this support ticket.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-lg p-6 space-y-4">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {ticket.title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{ticket.description}</p>

        {ticket.status && (
          <>
            <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4 space-y-2">
              <p>
                <span className="font-semibold text-gray-800 dark:text-white">Status:</span>{" "}
                <span className="capitalize">{ticket.status}</span>
              </p>

              {ticket.priority && (
                <p>
                  <span className="font-semibold text-gray-800 dark:text-white">Priority:</span>{" "}
                  <span className="capitalize">{ticket.priority}</span>
                </p>
              )}

              {ticket.relatedSkills?.length > 0 && (
                <p>
                  <span className="font-semibold text-gray-800 dark:text-white">Related Skills:</span>{" "}
                  {ticket.relatedSkills.join(", ")}
                </p>
              )}

              {ticket.assignedTo && (
                <p>
                  <span className="font-semibold text-gray-800 dark:text-white">Assigned To:</span>{" "}
                  {ticket.assignedTo?.email}
                </p>
              )}

              {ticket.createdAt && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created At: {new Date(ticket.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          </>
        )}

        {ticket.helpfulNotes && (
          <div className="pt-4 border-t border-gray-300 dark:border-gray-600 mt-4">
            <p className="font-semibold text-gray-800 dark:text-white mb-2">Helpful Notes:</p>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
