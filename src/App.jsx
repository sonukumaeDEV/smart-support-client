import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateComplaint from "./pages/CreateComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";
import AdminDashboard from "./pages/AdminDashboard";

import AgentDashboard from "./pages/AgentDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
  path="/agent"
  element={<AgentDashboard />}
/>

        <Route
          path="/complaints/new"
          element={<CreateComplaint />}
        />

        <Route
          path="/complaints/:id"
          element={<ComplaintDetails />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";

// import Register from "./pages/Register";
// import Login from "./pages/Login";

// function Dashboard() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-950">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-white">
//           Dashboard
//         </h1>

//         <p className="mt-3 text-slate-400">
//           Login successful 🎉
//         </p>
//       </div>
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         <Route
//           path="/"
//           element={<Navigate to="/login" replace />}
//         />

//         <Route
//           path="/register"
//           element={<Register />}
//         />

//         <Route
//           path="/login"
//           element={<Login />}
//         />

//         <Route
//           path="/dashboard"
//           element={<Dashboard />}
//         />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;