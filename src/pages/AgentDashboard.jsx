
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Headphones,
  LogOut,
  RefreshCw,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";

import api from "../services/api";
import NotificationBell from "../components/NotificationBell";

function AgentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      const role =
        parsedUser?.role || parsedUser?.Role;

      if (role !== "SupportAgent") {
        navigate("/dashboard", {
          replace: true,
        });
        return;
      }

      setUser(parsedUser);

      loadAssignedComplaints();
    } catch (err) {
      console.error("User parsing error:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    }
  }, [navigate]);

  const loadAssignedComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/Complaint/assigned"
      );

      setComplaints(response.data || []);
    } catch (err) {
      console.error(
        "Assigned complaints error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load assigned complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Assigned":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "In Progress":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "Resolved":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "Open":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
      case "Critical":
        return "text-red-400";

      case "Medium":
        return "text-yellow-400";

      case "Low":
        return "text-green-400";

      default:
        return "text-slate-300";
    }
  };

  const total = complaints.length;

  const assigned = complaints.filter(
    (c) =>
      (c.status ?? c.Status) === "Assigned"
  ).length;

  const inProgress = complaints.filter(
    (c) =>
      (c.status ?? c.Status) === "In Progress"
  ).length;

  const resolved = complaints.filter(
    (c) =>
      (c.status ?? c.Status) === "Resolved"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* BRAND */}

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
              <Headphones size={23} />
            </div>

            <div>

              <h1 className="text-lg font-bold">
                SmartSupport
              </h1>

              <p className="text-xs text-slate-400">
                Support Agent Panel
              </p>

            </div>

          </div>

          {/* USER */}

          <div className="flex items-center gap-4">

            {/* NOTIFICATION BELL */}

            <NotificationBell />

            {user && (
              <div className="hidden text-right sm:block">

                <p className="text-sm font-semibold">
                  {user.name || user.Name}
                </p>

                <p className="text-xs text-cyan-400">
                  Support Agent
                </p>

              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm transition hover:bg-slate-700"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>

            <p className="text-sm font-medium text-cyan-400">
              Support Operations
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              Agent Dashboard
            </h2>

            <p className="mt-2 text-slate-400">
              Manage complaints assigned to you.
            </p>

          </div>

          <button
            onClick={loadAssignedComplaints}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* STATS */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">

              <p className="text-sm text-slate-400">
                Total Assigned
              </p>

              <Ticket
                size={20}
                className="text-cyan-400"
              />

            </div>

            <p className="mt-3 text-3xl font-bold">
              {total}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">

              <p className="text-sm text-slate-400">
                Assigned
              </p>

              <Clock
                size={20}
                className="text-purple-400"
              />

            </div>

            <p className="mt-3 text-3xl font-bold text-purple-400">
              {assigned}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">

              <p className="text-sm text-slate-400">
                In Progress
              </p>

              <AlertCircle
                size={20}
                className="text-yellow-400"
              />

            </div>

            <p className="mt-3 text-3xl font-bold text-yellow-400">
              {inProgress}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">

              <p className="text-sm text-slate-400">
                Resolved
              </p>

              <CheckCircle2
                size={20}
                className="text-green-400"
              />

            </div>

            <p className="mt-3 text-3xl font-bold text-green-400">
              {resolved}
            </p>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">

            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

          </div>
        )}

        {/* COMPLAINTS */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 px-6 py-5">

            <h3 className="text-lg font-semibold">
              Assigned Complaints
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Complaints currently assigned to your account.
            </p>

          </div>

          {loading ? (

            <div className="px-6 py-14 text-center text-slate-400">
              Loading assigned complaints...
            </div>

          ) : complaints.length === 0 ? (

            <div className="px-6 py-14 text-center">

              <Ticket
                size={40}
                className="mx-auto text-slate-600"
              />

              <p className="mt-4 font-medium text-slate-300">
                No complaints assigned
              </p>

              <p className="mt-1 text-sm text-slate-500">
                New complaints assigned by the admin will appear here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="border-b border-slate-800 bg-slate-950">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      ID
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Complaint
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Priority
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800">

                  {complaints.map((complaint) => {

                    const id =
                      complaint.id ??
                      complaint.Id;

                    const title =
                      complaint.title ??
                      complaint.Title;

                    const customer =
                      complaint.userName ??
                      complaint.UserName;

                    const priority =
                      complaint.priority ??
                      complaint.Priority;

                    const status =
                      complaint.status ??
                      complaint.Status;

                    return (
                      <tr
                        key={id}
                        className="transition hover:bg-slate-800/40"
                      >

                        <td className="px-6 py-5 text-sm text-slate-400">
                          #{id}
                        </td>

                        <td className="max-w-xs px-6 py-5">

                          <p className="truncate text-sm font-semibold">
                            {title}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <User
                              size={16}
                              className="text-slate-500"
                            />

                            <span className="text-sm text-slate-300">
                              {customer || "Unknown"}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`text-sm font-medium ${getPriorityClass(
                              priority
                            )}`}
                          >
                            {priority || "Medium"}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs ${getStatusClass(
                              status
                            )}`}
                          >
                            {status || "Assigned"}
                          </span>

                        </td>

                        <td className="px-6 py-5 text-right">

                          <button
                            onClick={() =>
                              navigate(
                                `/complaints/${id}`
                              )
                            }
                            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                          >
                            View
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default AgentDashboard;



















// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Headphones,
//   LogOut,
//   RefreshCw,
//   Ticket,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   User,
// } from "lucide-react";

// import api from "../services/api";

// function AgentDashboard() {
//   const navigate = useNavigate();

//   const [user, setUser] = useState(null);
//   const [complaints, setComplaints] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const storedUser = localStorage.getItem("user");

//     if (!token || !storedUser) {
//       navigate("/login");
//       return;
//     }

//     try {
//       const parsedUser = JSON.parse(storedUser);

//       const role = parsedUser?.role || parsedUser?.Role;

//       if (role !== "SupportAgent") {
//         navigate("/dashboard", { replace: true });
//         return;
//       }

//       setUser(parsedUser);

//       loadAssignedComplaints();
//     } catch (err) {
//       console.error("User parsing error:", err);
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       navigate("/login");
//     }
//   }, [navigate]);

//   const loadAssignedComplaints = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get("/Complaint/assigned");

//       setComplaints(response.data || []);
//     } catch (err) {
//       console.error("Assigned complaints error:", err);

//       setError(
//         err.response?.data?.message ||
//           "Unable to load assigned complaints."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     navigate("/login");
//   };

//   const getStatusClass = (status) => {
//     switch (status) {
//       case "Assigned":
//         return "bg-purple-500/10 text-purple-400 border-purple-500/20";

//       case "In Progress":
//         return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

//       case "Resolved":
//         return "bg-green-500/10 text-green-400 border-green-500/20";

//       case "Open":
//         return "bg-blue-500/10 text-blue-400 border-blue-500/20";

//       default:
//         return "bg-slate-500/10 text-slate-400 border-slate-500/20";
//     }
//   };

//   const getPriorityClass = (priority) => {
//     switch (priority) {
//       case "High":
//       case "Critical":
//         return "text-red-400";

//       case "Medium":
//         return "text-yellow-400";

//       case "Low":
//         return "text-green-400";

//       default:
//         return "text-slate-300";
//     }
//   };

//   const total = complaints.length;

//   const assigned = complaints.filter(
//     (c) =>
//       (c.status ?? c.Status) === "Assigned"
//   ).length;

//   const inProgress = complaints.filter(
//     (c) =>
//       (c.status ?? c.Status) === "In Progress"
//   ).length;

//   const resolved = complaints.filter(
//     (c) =>
//       (c.status ?? c.Status) === "Resolved"
//   ).length;

//   return (
//     <div className="min-h-screen bg-slate-950 text-white">

//       {/* NAVBAR */}

//       <nav className="border-b border-slate-800 bg-slate-900/80">

//         <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

//           {/* BRAND */}

//           <div className="flex items-center gap-3">

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
//               <Headphones size={23} />
//             </div>

//             <div>

//               <h1 className="text-lg font-bold">
//                 SmartSupport
//               </h1>

//               <p className="text-xs text-slate-400">
//                 Support Agent Panel
//               </p>

//             </div>

//           </div>

//           {/* USER */}

//           <div className="flex items-center gap-4">

//             {user && (
//               <div className="hidden text-right sm:block">

//                 <p className="text-sm font-semibold">
//                   {user.name || user.Name}
//                 </p>

//                 <p className="text-xs text-cyan-400">
//                   Support Agent
//                 </p>

//               </div>
//             )}

//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm transition hover:bg-slate-700"
//             >
//               <LogOut size={16} />
//               Logout
//             </button>

//           </div>

//         </div>

//       </nav>

//       {/* MAIN */}

//       <main className="mx-auto max-w-7xl px-6 py-8">

//         {/* HEADER */}

//         <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

//           <div>

//             <p className="text-sm font-medium text-cyan-400">
//               Support Operations
//             </p>

//             <h2 className="mt-1 text-3xl font-bold">
//               Agent Dashboard
//             </h2>

//             <p className="mt-2 text-slate-400">
//               Manage complaints assigned to you.
//             </p>

//           </div>

//           <button
//             onClick={loadAssignedComplaints}
//             disabled={loading}
//             className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
//           >
//             <RefreshCw
//               size={17}
//               className={loading ? "animate-spin" : ""}
//             />

//             Refresh
//           </button>

//         </div>

//         {/* STATS */}

//         <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

//           {/* TOTAL */}

//           <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

//             <div className="flex items-center justify-between">

//               <p className="text-sm text-slate-400">
//                 Total Assigned
//               </p>

//               <Ticket
//                 size={20}
//                 className="text-cyan-400"
//               />

//             </div>

//             <p className="mt-3 text-3xl font-bold">
//               {total}
//             </p>

//           </div>

//           {/* ASSIGNED */}

//           <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

//             <div className="flex items-center justify-between">

//               <p className="text-sm text-slate-400">
//                 Assigned
//               </p>

//               <Clock
//                 size={20}
//                 className="text-purple-400"
//               />

//             </div>

//             <p className="mt-3 text-3xl font-bold text-purple-400">
//               {assigned}
//             </p>

//           </div>

//           {/* IN PROGRESS */}

//           <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

//             <div className="flex items-center justify-between">

//               <p className="text-sm text-slate-400">
//                 In Progress
//               </p>

//               <AlertCircle
//                 size={20}
//                 className="text-yellow-400"
//               />

//             </div>

//             <p className="mt-3 text-3xl font-bold text-yellow-400">
//               {inProgress}
//             </p>

//           </div>

//           {/* RESOLVED */}

//           <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

//             <div className="flex items-center justify-between">

//               <p className="text-sm text-slate-400">
//                 Resolved
//               </p>

//               <CheckCircle2
//                 size={20}
//                 className="text-green-400"
//               />

//             </div>

//             <p className="mt-3 text-3xl font-bold text-green-400">
//               {resolved}
//             </p>

//           </div>

//         </div>

//         {/* ERROR */}

//         {error && (
//           <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">

//             <AlertCircle
//               size={18}
//               className="mt-0.5 shrink-0"
//             />

//             <span>{error}</span>

//           </div>
//         )}

//         {/* COMPLAINTS */}

//         <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

//           <div className="border-b border-slate-800 px-6 py-5">

//             <h3 className="text-lg font-semibold">
//               Assigned Complaints
//             </h3>

//             <p className="mt-1 text-sm text-slate-400">
//               Complaints currently assigned to your account.
//             </p>

//           </div>

//           {loading ? (

//             <div className="px-6 py-14 text-center text-slate-400">
//               Loading assigned complaints...
//             </div>

//           ) : complaints.length === 0 ? (

//             <div className="px-6 py-14 text-center">

//               <Ticket
//                 size={40}
//                 className="mx-auto text-slate-600"
//               />

//               <p className="mt-4 font-medium text-slate-300">
//                 No complaints assigned
//               </p>

//               <p className="mt-1 text-sm text-slate-500">
//                 New complaints assigned by the admin will appear here.
//               </p>

//             </div>

//           ) : (

//             <div className="overflow-x-auto">

//               <table className="w-full">

//                 <thead className="border-b border-slate-800 bg-slate-950">

//                   <tr>

//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
//                       ID
//                     </th>

//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
//                       Complaint
//                     </th>

//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
//                       Customer
//                     </th>

//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
//                       Priority
//                     </th>

//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
//                       Status
//                     </th>

//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
//                       Action
//                     </th>

//                   </tr>

//                 </thead>

//                 <tbody className="divide-y divide-slate-800">

//                   {complaints.map((complaint) => {

//                     const id =
//                       complaint.id ??
//                       complaint.Id;

//                     const title =
//                       complaint.title ??
//                       complaint.Title;

//                     const customer =
//                       complaint.userName ??
//                       complaint.UserName;

//                     const priority =
//                       complaint.priority ??
//                       complaint.Priority;

//                     const status =
//                       complaint.status ??
//                       complaint.Status;

//                     return (
//                       <tr
//                         key={id}
//                         className="transition hover:bg-slate-800/40"
//                       >

//                         {/* ID */}

//                         <td className="px-6 py-5 text-sm text-slate-400">
//                           #{id}
//                         </td>

//                         {/* TITLE */}

//                         <td className="max-w-xs px-6 py-5">

//                           <p className="truncate text-sm font-semibold">
//                             {title}
//                           </p>

//                         </td>

//                         {/* CUSTOMER */}

//                         <td className="px-6 py-5">

//                           <div className="flex items-center gap-2">

//                             <User
//                               size={16}
//                               className="text-slate-500"
//                             />

//                             <span className="text-sm text-slate-300">
//                               {customer || "Unknown"}
//                             </span>

//                           </div>

//                         </td>

//                         {/* PRIORITY */}

//                         <td className="px-6 py-5">

//                           <span
//                             className={`text-sm font-medium ${getPriorityClass(
//                               priority
//                             )}`}
//                           >
//                             {priority || "Medium"}
//                           </span>

//                         </td>

//                         {/* STATUS */}

//                         <td className="px-6 py-5">

//                           <span
//                             className={`rounded-full border px-2.5 py-1 text-xs ${getStatusClass(
//                               status
//                             )}`}
//                           >
//                             {status || "Assigned"}
//                           </span>

//                         </td>

//                         {/* ACTION */}

//                         <td className="px-6 py-5 text-right">

//                           <button
//                             onClick={() =>
//                               navigate(`/complaints/${id}`)
//                             }
//                             className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
//                           >
//                             View
//                           </button>

//                         </td>

//                       </tr>
//                     );
//                   })}

//                 </tbody>

//               </table>

//             </div>

//           )}

//         </div>

//       </main>

//     </div>
//   );
// }

// export default AgentDashboard;

