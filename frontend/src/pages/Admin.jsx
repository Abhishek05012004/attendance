import { useEffect, useState } from "react";
import API from "../services/api";

export default function Admin() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    API.get("/attendance/logs").then((res) => setLogs(res.data));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">All Attendance Logs</h2>
      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Date</th>
            <th className="p-3">Check In</th>
            <th className="p-3">Check Out</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="border-t">
              <td className="p-3">{log.user.name}</td>
              <td className="p-3">{log.date}</td>
              <td className="p-3">{log.checkIn || "--"}</td>
              <td className="p-3">{log.checkOut || "--"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
