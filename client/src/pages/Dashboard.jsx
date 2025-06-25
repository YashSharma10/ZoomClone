import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    API.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
      });
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {user ? (
        <>
          <p>
            Welcome, <strong>{user.name}</strong>
          </p>
          <p>Email: {user.email}</p>
          <button
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload(); // refresh to be kicked out by ProtectedRoute
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <p>Loading user info...</p>
      )}
      <button
        onClick={() => navigate("/call")}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Start Video Call
      </button>
      <button
        onClick={() => navigate("/chat")}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Chat
      </button>
    </div>
  );
}
