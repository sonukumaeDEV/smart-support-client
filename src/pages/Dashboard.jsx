
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import NotificationBell from "../components/NotificationBell";

function Dashboard() {
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

      setUser(parsedUser);

      loadComplaints(parsedUser);
    } catch (err) {
      console.error("User data error:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    }
  }, [navigate]);

  const loadComplaints = async (currentUser) => {
    try {
      setLoading(true);
      setError("");

      const role =
        currentUser?.Role ||
        currentUser?.role;

      let response;

      if (role === "Customer") {
        response = await api.get("/Complaint/my");
      } else if (role === "SupportAgent") {
        response = await api.get("/Complaint/assigned");
      } else if (role === "Admin") {
        response = await api.get("/Complaint");
      } else {
        setError("Invalid user role.");
        return;
      }

      setComplaints(response.data || []);
    } catch (err) {
      console.error("Complaint API error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view these complaints."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load complaints."
        );
      }
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
      case "Open":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "Assigned":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "In Progress":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "Resolved":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "Closed":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-400";

      case "Medium":
        return "text-yellow-400";

      case "Low":
        return "text-green-400";

      default:
        return "text-slate-400";
    }
  };

  const totalComplaints = complaints.length;

  const openComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "Open" ||
      complaint.Status === "Open"
  ).length;

  const inProgressComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "In Progress" ||
      complaint.Status === "In Progress" ||
      complaint.status === "Assigned" ||
      complaint.Status === "Assigned"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) =>
      complaint.status === "Resolved" ||
      complaint.Status === "Resolved" ||
      complaint.status === "Closed" ||
      complaint.Status === "Closed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* BRAND */}

          <div>

            <h1 className="text-xl font-bold text-white">
              SmartSupport
            </h1>

            <p className="text-xs text-slate-400">
              AI Smart Complaint Management
            </p>

          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-4">

            {/* NOTIFICATION BELL */}

            <NotificationBell />

            {user && (
              <div className="hidden text-right sm:block">

                <p className="text-sm font-semibold text-white">
                  {user.Name || user.name}
                </p>

                <p className="text-xs text-slate-400">
                  {user.Role || user.role}
                </p>

              </div>
            )}

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <p className="mb-1 text-sm text-cyan-400">
              Welcome back 👋
            </p>

            <h2 className="text-3xl font-bold tracking-tight">
              Dashboard
            </h2>

            <p className="mt-2 text-slate-400">
              Manage and track your support complaints.
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/complaints/new")
            }
            className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
          >
            + New Complaint
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              Total Complaints
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalComplaints}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              Open
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {openComplaints}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {inProgressComplaints}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {resolvedComplaints}
            </p>

          </div>

        </div>

        {/* COMPLAINTS */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

            <div>

              <h3 className="text-lg font-semibold">
                My Complaints
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Your recent support requests
              </p>

            </div>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {complaints.length} total
            </span>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="px-6 py-12 text-center text-slate-400">
              Loading complaints...
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            complaints.length === 0 && (
              <div className="px-6 py-16 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
                  📋
                </div>

                <h4 className="text-lg font-semibold">
                  No complaints yet
                </h4>

                <p className="mt-2 text-sm text-slate-400">
                  You haven't created any complaint yet.
                </p>

                <button
                  onClick={() =>
                    navigate("/complaints/new")
                  }
                  className="mt-5 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Create Your First Complaint
                </button>

              </div>
            )}

          {/* COMPLAINT LIST */}

          {!loading &&
            complaints.length > 0 && (
              <div className="divide-y divide-slate-800">

                {complaints.map((complaint) => {

                  const id =
                    complaint.id ??
                    complaint.Id;

                  const title =
                    complaint.title ??
                    complaint.Title;

                  const description =
                    complaint.description ??
                    complaint.Description;

                  const status =
                    complaint.status ??
                    complaint.Status;

                  const priority =
                    complaint.priority ??
                    complaint.Priority;

                  const category =
                    complaint.categoryName ??
                    complaint.CategoryName;

                  const createdAt =
                    complaint.createdAt ??
                    complaint.CreatedAt;

                  return (
                    <div
                      key={id}
                      className="p-6 transition hover:bg-slate-800/40"
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="mb-2 flex flex-wrap items-center gap-2">

                            <span className="text-xs text-slate-500">
                              #{id}
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>

                          </div>

                          <h4 className="text-lg font-semibold text-white">
                            {title}
                          </h4>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                            {description}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-4 text-xs">

                            <span className="text-slate-500">
                              Priority:{" "}
                              <span
                                className={`font-semibold ${getPriorityClass(
                                  priority
                                )}`}
                              >
                                {priority}
                              </span>
                            </span>

                            {category && (
                              <span className="text-slate-500">
                                Category:{" "}
                                <span className="text-slate-300">
                                  {category}
                                </span>
                              </span>
                            )}

                            {createdAt && (
                              <span className="text-slate-500">
                                {new Date(
                                  createdAt
                                ).toLocaleDateString()}
                              </span>
                            )}

                          </div>

                        </div>

                        <button
                          onClick={() =>
                            navigate(
                              `/complaints/${id}`
                            )
                          }
                          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                        >
                          View Details
                        </button>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;











// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api";

// function Dashboard() {
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
//       setUser(parsedUser);
//       loadComplaints(parsedUser);
//     } catch (err) {
//       console.error("User data error:", err);
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       navigate("/login");
//     }
//   }, [navigate]);

//   const loadComplaints = async (currentUser) => {
//     try {
//       setLoading(true);
//       setError("");

//       const role = currentUser?.Role || currentUser?.role;

//       let response;

//       // Customer apni complaints dekhega
//       if (role === "Customer") {
//         response = await api.get("/Complaint/my");
//       }

//       // SupportAgent sirf assigned complaints dekhega
//       else if (role === "SupportAgent") {
//         response = await api.get("/Complaint/assigned");
//       }

//       // Admin saari complaints dekhega
//       else if (role === "Admin") {
//         response = await api.get("/Complaint");
//       }

//       else {
//         setError("Invalid user role.");
//         return;
//       }

//       setComplaints(response.data || []);
//     } catch (err) {
//       console.error("Complaint API error:", err);

//       if (err.response?.status === 401) {
//         setError("Your session has expired. Please login again.");
//       } else if (err.response?.status === 403) {
//         setError("You do not have permission to view these complaints.");
//       } else {
//         setError(
//           err.response?.data?.message ||
//             "Unable to load complaints."
//         );
//       }
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
//       case "Open":
//         return "bg-blue-500/10 text-blue-400 border-blue-500/20";

//       case "Assigned":
//         return "bg-purple-500/10 text-purple-400 border-purple-500/20";

//       case "In Progress":
//         return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

//       case "Resolved":
//         return "bg-green-500/10 text-green-400 border-green-500/20";

//       case "Closed":
//         return "bg-slate-500/10 text-slate-400 border-slate-500/20";

//       default:
//         return "bg-slate-500/10 text-slate-400 border-slate-500/20";
//     }
//   };

//   const getPriorityClass = (priority) => {
//     switch (priority) {
//       case "High":
//         return "text-red-400";

//       case "Medium":
//         return "text-yellow-400";

//       case "Low":
//         return "text-green-400";

//       default:
//         return "text-slate-400";
//     }
//   };

//   const totalComplaints = complaints.length;

//   const openComplaints = complaints.filter(
//     (complaint) =>
//       complaint.status === "Open" ||
//       complaint.Status === "Open"
//   ).length;

//   const inProgressComplaints = complaints.filter(
//     (complaint) =>
//       complaint.status === "In Progress" ||
//       complaint.Status === "In Progress" ||
//       complaint.status === "Assigned" ||
//       complaint.Status === "Assigned"
//   ).length;

//   const resolvedComplaints = complaints.filter(
//     (complaint) =>
//       complaint.status === "Resolved" ||
//       complaint.Status === "Resolved" ||
//       complaint.status === "Closed" ||
//       complaint.Status === "Closed"
//   ).length;

//   return (
//     <div className="min-h-screen bg-slate-950 text-white">

//       {/* NAVBAR */}
//       <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

//           <div>
//             <h1 className="text-xl font-bold text-white">
//               SmartSupport
//             </h1>

//             <p className="text-xs text-slate-400">
//               AI Smart Complaint Management
//             </p>
//           </div>

//           <div className="flex items-center gap-4">

//             {user && (
//               <div className="hidden text-right sm:block">
//                 <p className="text-sm font-semibold text-white">
//                   {user.Name || user.name}
//                 </p>

//                 <p className="text-xs text-slate-400">
//                   {user.Role || user.role}
//                 </p>
//               </div>
//             )}

//             <button
//               onClick={handleLogout}
//               className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
//             >
//               Logout
//             </button>

//           </div>
//         </div>
//       </nav>

//       {/* MAIN */}
//       <main className="mx-auto max-w-7xl px-6 py-8">

//         {/* HEADER */}
//         <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

//           <div>
//             <p className="mb-1 text-sm text-cyan-400">
//               Welcome back 👋
//             </p>

//             <h2 className="text-3xl font-bold tracking-tight">
//               Dashboard
//             </h2>

//             <p className="mt-2 text-slate-400">
//               Manage and track your support complaints.
//             </p>
//           </div>

//           <button
//             onClick={() => navigate("/complaints/new")}
//             className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
//           >
//             + New Complaint
//           </button>

//         </div>

//         {/* ERROR */}
//         {error && (
//           <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
//             {error}
//           </div>
//         )}

//         {/* STATS */}
//         <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

//           <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
//             <p className="text-sm text-slate-400">
//               Total Complaints
//             </p>

//             <p className="mt-2 text-3xl font-bold">
//               {totalComplaints}
//             </p>
//           </div>

//           <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
//             <p className="text-sm text-slate-400">
//               Open
//             </p>

//             <p className="mt-2 text-3xl font-bold text-blue-400">
//               {openComplaints}
//             </p>
//           </div>

//           <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
//             <p className="text-sm text-slate-400">
//               In Progress
//             </p>

//             <p className="mt-2 text-3xl font-bold text-yellow-400">
//               {inProgressComplaints}
//             </p>
//           </div>

//           <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
//             <p className="text-sm text-slate-400">
//               Resolved
//             </p>

//             <p className="mt-2 text-3xl font-bold text-green-400">
//               {resolvedComplaints}
//             </p>
//           </div>

//         </div>

//         {/* COMPLAINTS */}
//         <div className="rounded-2xl border border-slate-800 bg-slate-900">

//           <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

//             <div>
//               <h3 className="text-lg font-semibold">
//                 My Complaints
//               </h3>

//               <p className="mt-1 text-sm text-slate-400">
//                 Your recent support requests
//               </p>
//             </div>

//             <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
//               {complaints.length} total
//             </span>

//           </div>

//           {/* LOADING */}
//           {loading && (
//             <div className="px-6 py-12 text-center text-slate-400">
//               Loading complaints...
//             </div>
//           )}

//           {/* EMPTY */}
//           {!loading && !error && complaints.length === 0 && (
//             <div className="px-6 py-16 text-center">

//               <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
//                 📋
//               </div>

//               <h4 className="text-lg font-semibold">
//                 No complaints yet
//               </h4>

//               <p className="mt-2 text-sm text-slate-400">
//                 You haven't created any complaint yet.
//               </p>

//               <button
//                 onClick={() => navigate("/complaints/new")}
//                 className="mt-5 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
//               >
//                 Create Your First Complaint
//               </button>

//             </div>
//           )}

//           {/* COMPLAINT LIST */}
//           {!loading && complaints.length > 0 && (
//             <div className="divide-y divide-slate-800">

//               {complaints.map((complaint) => {

//                 const id = complaint.id ?? complaint.Id;
//                 const title =
//                   complaint.title ?? complaint.Title;

//                 const description =
//                   complaint.description ?? complaint.Description;

//                 const status =
//                   complaint.status ?? complaint.Status;

//                 const priority =
//                   complaint.priority ?? complaint.Priority;

//                 const category =
//                   complaint.categoryName ??
//                   complaint.CategoryName;

//                 const createdAt =
//                   complaint.createdAt ??
//                   complaint.CreatedAt;

//                 return (
//                   <div
//                     key={id}
//                     className="p-6 transition hover:bg-slate-800/40"
//                   >

//                     <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

//                       <div className="min-w-0 flex-1">

//                         <div className="mb-2 flex flex-wrap items-center gap-2">

//                           <span className="text-xs text-slate-500">
//                             #{id}
//                           </span>

//                           <span
//                             className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
//                               status
//                             )}`}
//                           >
//                             {status}
//                           </span>

//                         </div>

//                         <h4 className="text-lg font-semibold text-white">
//                           {title}
//                         </h4>

//                         <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
//                           {description}
//                         </p>

//                         <div className="mt-4 flex flex-wrap gap-4 text-xs">

//                           <span className="text-slate-500">
//                             Priority:{" "}
//                             <span
//                               className={`font-semibold ${getPriorityClass(
//                                 priority
//                               )}`}
//                             >
//                               {priority}
//                             </span>
//                           </span>

//                           {category && (
//                             <span className="text-slate-500">
//                               Category:{" "}
//                               <span className="text-slate-300">
//                                 {category}
//                               </span>
//                             </span>
//                           )}

//                           {createdAt && (
//                             <span className="text-slate-500">
//                               {new Date(
//                                 createdAt
//                               ).toLocaleDateString()}
//                             </span>
//                           )}

//                         </div>

//                       </div>

//                       <button
//                         onClick={() =>
//                           navigate(`/complaints/${id}`)
//                         }
//                         className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
//                       >
//                         View Details
//                       </button>

//                     </div>

//                   </div>
//                 );
//               })}

//             </div>
//           )}

//         </div>

//       </main>
//     </div>
//   );
// }

// export default Dashboard;