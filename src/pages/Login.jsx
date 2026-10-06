
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Headphones,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/Auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const data = response.data;

      // ==============================
      // SAVE JWT TOKEN
      // ==============================

      localStorage.setItem("token", data.token);

      // ==============================
      // SAVE USER INFORMATION
      // ==============================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // ==============================
      // ROLE BASED REDIRECT
      // ==============================

      const role = data.user.role || data.user.Role;

      console.log("Logged in user:", data.user);
      console.log("User role:", role);

      // Admin → Admin Dashboard
      if (role === "Admin") {
        navigate("/admin");
      }

      // Support Agent → Agent Dashboard
      else if (role === "SupportAgent") {
        navigate("/agent");
      }

      // Customer → Customer Dashboard
      else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Invalid email or password."
        );
      } else if (error.request) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ================= LEFT SIDE ================= */}

        <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-800">

          <div className="absolute inset-0 bg-black/10" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12">

            {/* Logo */}

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Headphones size={26} />
              </div>

              <div>

                <h1 className="text-xl font-bold">
                  SmartSupport
                </h1>

                <p className="text-sm text-indigo-100">
                  AI Complaint Management
                </p>

              </div>

            </div>

            {/* Main Content */}

            <div className="max-w-lg">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">

                <ShieldCheck size={17} />

                Secure Support Platform

              </div>

              <h2 className="text-5xl font-bold leading-tight">

                Welcome back to

                <span className="block text-indigo-100">
                  SmartSupport
                </span>

              </h2>

              <p className="mt-6 text-lg leading-8 text-indigo-100">

                Manage complaints, track support requests,
                and get AI-powered assistance from one
                intelligent platform.

              </p>

              <div className="mt-10 grid grid-cols-3 gap-4">

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">

                  <p className="text-2xl font-bold">
                    AI
                  </p>

                  <p className="mt-1 text-xs text-indigo-100">
                    Smart Analysis
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">

                  <p className="text-2xl font-bold">
                    24/7
                  </p>

                  <p className="mt-1 text-xs text-indigo-100">
                    Support
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">

                  <p className="text-2xl font-bold">
                    100%
                  </p>

                  <p className="mt-1 text-xs text-indigo-100">
                    Secure
                  </p>

                </div>

              </div>

            </div>

            {/* Footer */}

            <p className="text-sm text-indigo-100">
              © 2026 SmartSupport. All rights reserved.
            </p>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}

            <div className="mb-10 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">

                <Headphones size={23} />

              </div>

              <div>

                <h1 className="font-bold">
                  SmartSupport
                </h1>

                <p className="text-xs text-slate-400">
                  AI Complaint Management
                </p>

              </div>

            </div>

            {/* Heading */}

            <div className="mb-8">

              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-2 text-slate-400">
                Sign in to continue to your account.
              </p>

            </div>

            {/* Error Message */}

            {error && (

              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">

                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>

              </div>

            )}

            {/* Login Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}

                  </button>

                </div>

              </div>

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>

                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Signing in...

                  </>
                ) : (
                  <>

                    <LogIn size={19} />

                    Sign In

                  </>
                )}

              </button>

            </form>

            {/* Register */}

            <div className="mt-8 text-center text-sm text-slate-400">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-semibold text-indigo-400 transition hover:text-indigo-300"
              >
                Create account
              </Link>

            </div>

            {/* Security */}

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">

              <ShieldCheck size={15} />

              Your account is protected with secure authentication.

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;




















// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   LogIn,
//   ShieldCheck,
//   Headphones,
//   AlertCircle,
// } from "lucide-react";

// import api from "../services/api";

// function Login() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");

//     if (!formData.email || !formData.password) {
//       setError("Please enter your email and password.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await api.post("/Auth/login", {
//         email: formData.email,
//         password: formData.password,
//       });

//       const data = response.data;

//       // ==============================
//       // SAVE JWT TOKEN
//       // ==============================

//       localStorage.setItem("token", data.token);

//       // ==============================
//       // SAVE USER INFORMATION
//       // ==============================

//       localStorage.setItem(
//         "user",
//         JSON.stringify(data.user)
//       );

//       // ==============================
//       // ROLE BASED REDIRECT
//       // ==============================

//       const role = data.user.role || data.user.Role;

//       console.log("Logged in user:", data.user);
//       console.log("User role:", role);

//       if (role === "Admin") {
//         navigate("/admin");
//       } else {
//         navigate("/dashboard");
//       }

//     } catch (error) {
//       console.error("Login Error:", error);

//       if (error.response) {
//         setError(
//           error.response.data?.message ||
//             "Invalid email or password."
//         );
//       } else if (error.request) {
//         setError(
//           "Unable to connect to the server. Please make sure the backend is running."
//         );
//       } else {
//         setError(
//           "Something went wrong. Please try again."
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-white">
//       <div className="grid min-h-screen lg:grid-cols-2">

//         {/* ================= LEFT SIDE ================= */}

//         <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-800">

//           <div className="absolute inset-0 bg-black/10" />

//           <div className="relative z-10 flex w-full flex-col justify-between p-12">

//             {/* Logo */}

//             <div className="flex items-center gap-3">

//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
//                 <Headphones size={26} />
//               </div>

//               <div>

//                 <h1 className="text-xl font-bold">
//                   SmartSupport
//                 </h1>

//                 <p className="text-sm text-indigo-100">
//                   AI Complaint Management
//                 </p>

//               </div>

//             </div>

//             {/* Main Content */}

//             <div className="max-w-lg">

//               <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">

//                 <ShieldCheck size={17} />

//                 Secure Support Platform

//               </div>

//               <h2 className="text-5xl font-bold leading-tight">

//                 Welcome back to

//                 <span className="block text-indigo-100">
//                   SmartSupport
//                 </span>

//               </h2>

//               <p className="mt-6 text-lg leading-8 text-indigo-100">

//                 Manage complaints, track support requests,
//                 and get AI-powered assistance from one
//                 intelligent platform.

//               </p>

//               <div className="mt-10 grid grid-cols-3 gap-4">

//                 <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">

//                   <p className="text-2xl font-bold">
//                     AI
//                   </p>

//                   <p className="mt-1 text-xs text-indigo-100">
//                     Smart Analysis
//                   </p>

//                 </div>

//                 <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">

//                   <p className="text-2xl font-bold">
//                     24/7
//                   </p>

//                   <p className="mt-1 text-xs text-indigo-100">
//                     Support
//                   </p>

//                 </div>

//                 <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">

//                   <p className="text-2xl font-bold">
//                     100%
//                   </p>

//                   <p className="mt-1 text-xs text-indigo-100">
//                     Secure
//                   </p>

//                 </div>

//               </div>

//             </div>

//             {/* Footer */}

//             <p className="text-sm text-indigo-100">
//               © 2026 SmartSupport. All rights reserved.
//             </p>

//           </div>

//         </div>

//         {/* ================= RIGHT SIDE ================= */}

//         <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">

//           <div className="w-full max-w-md">

//             {/* Mobile Logo */}

//             <div className="mb-10 flex items-center gap-3 lg:hidden">

//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">

//                 <Headphones size={23} />

//               </div>

//               <div>

//                 <h1 className="font-bold">
//                   SmartSupport
//                 </h1>

//                 <p className="text-xs text-slate-400">
//                   AI Complaint Management
//                 </p>

//               </div>

//             </div>

//             {/* Heading */}

//             <div className="mb-8">

//               <h2 className="text-3xl font-bold tracking-tight">
//                 Welcome back
//               </h2>

//               <p className="mt-2 text-slate-400">
//                 Sign in to continue to your account.
//               </p>

//             </div>

//             {/* Error Message */}

//             {error && (

//               <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">

//                 <AlertCircle
//                   size={19}
//                   className="mt-0.5 shrink-0"
//                 />

//                 <span>{error}</span>

//               </div>

//             )}

//             {/* Login Form */}

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-5"
//             >

//               {/* Email */}

//               <div>

//                 <label
//                   htmlFor="email"
//                   className="mb-2 block text-sm font-medium text-slate-200"
//                 >
//                   Email Address
//                 </label>

//                 <div className="relative">

//                   <Mail
//                     size={19}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
//                   />

//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="Enter your email"
//                     autoComplete="email"
//                     className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
//                   />

//                 </div>

//               </div>

//               {/* Password */}

//               <div>

//                 <div className="mb-2 flex items-center justify-between">

//                   <label
//                     htmlFor="password"
//                     className="block text-sm font-medium text-slate-200"
//                   >
//                     Password
//                   </label>

//                   <button
//                     type="button"
//                     className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
//                   >
//                     Forgot password?
//                   </button>

//                 </div>

//                 <div className="relative">

//                   <Lock
//                     size={19}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
//                   />

//                   <input
//                     id="password"
//                     name="password"
//                     type={
//                       showPassword
//                         ? "text"
//                         : "password"
//                     }
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Enter your password"
//                     autoComplete="current-password"
//                     className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
//                   />

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setShowPassword((prev) => !prev)
//                     }
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
//                     aria-label={
//                       showPassword
//                         ? "Hide password"
//                         : "Show password"
//                     }
//                   >

//                     {showPassword ? (
//                       <EyeOff size={19} />
//                     ) : (
//                       <Eye size={19} />
//                     )}

//                   </button>

//                 </div>

//               </div>

//               {/* Login Button */}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
//               >

//                 {loading ? (
//                   <>

//                     <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

//                     Signing in...

//                   </>
//                 ) : (
//                   <>

//                     <LogIn size={19} />

//                     Sign In

//                   </>
//                 )}

//               </button>

//             </form>

//             {/* Register */}

//             <div className="mt-8 text-center text-sm text-slate-400">

//               Don't have an account?{" "}

//               <Link
//                 to="/register"
//                 className="font-semibold text-indigo-400 transition hover:text-indigo-300"
//               >
//                 Create account
//               </Link>

//             </div>

//             {/* Security */}

//             <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">

//               <ShieldCheck size={15} />

//               Your account is protected with secure authentication.

//             </div>

//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }

// export default Login;















// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   LogIn,
//   ShieldCheck,
//   Headphones,
//   AlertCircle,
// } from "lucide-react";

// import api from "../services/api";

// function Login() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");

//     if (!formData.email || !formData.password) {
//       setError("Please enter your email and password.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await api.post("/Auth/login", {
//         email: formData.email,
//         password: formData.password,
//       });

//       const data = response.data;

//       // Save JWT token
//       localStorage.setItem("token", data.token);

//       // Save logged-in user information
//       localStorage.setItem(
//         "user",
//         JSON.stringify(data.user)
//       );

//       // Redirect to dashboard
//       navigate("/dashboard");
//     } catch (error) {
//       console.error("Login Error:", error);

//       if (error.response) {
//         setError(
//           error.response.data?.message ||
//             "Invalid email or password."
//         );
//       } else if (error.request) {
//         setError(
//           "Unable to connect to the server. Please make sure the backend is running."
//         );
//       } else {
//         setError("Something went wrong. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-white">
//       <div className="grid min-h-screen lg:grid-cols-2">

//         {/* ================= LEFT SIDE ================= */}

//         <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-800">
          
//           <div className="absolute inset-0 bg-black/10" />

//           <div className="relative z-10 flex w-full flex-col justify-between p-12">

//             {/* Logo */}

//             <div className="flex items-center gap-3">
//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
//                 <Headphones size={26} />
//               </div>

//               <div>
//                 <h1 className="text-xl font-bold">
//                   SmartSupport
//                 </h1>

//                 <p className="text-sm text-indigo-100">
//                   AI Complaint Management
//                 </p>
//               </div>
//             </div>

//             {/* Main Content */}

//             <div className="max-w-lg">

//               <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
//                 <ShieldCheck size={17} />

//                 Secure Support Platform
//               </div>

//               <h2 className="text-5xl font-bold leading-tight">
//                 Welcome back to
//                 <span className="block text-indigo-100">
//                   SmartSupport
//                 </span>
//               </h2>

//               <p className="mt-6 text-lg leading-8 text-indigo-100">
//                 Manage complaints, track support requests,
//                 and get AI-powered assistance from one
//                 intelligent platform.
//               </p>

//               <div className="mt-10 grid grid-cols-3 gap-4">

//                 <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
//                   <p className="text-2xl font-bold">
//                     AI
//                   </p>

//                   <p className="mt-1 text-xs text-indigo-100">
//                     Smart Analysis
//                   </p>
//                 </div>

//                 <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
//                   <p className="text-2xl font-bold">
//                     24/7
//                   </p>

//                   <p className="mt-1 text-xs text-indigo-100">
//                     Support
//                   </p>
//                 </div>

//                 <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
//                   <p className="text-2xl font-bold">
//                     100%
//                   </p>

//                   <p className="mt-1 text-xs text-indigo-100">
//                     Secure
//                   </p>
//                 </div>

//               </div>
//             </div>

//             {/* Footer */}

//             <p className="text-sm text-indigo-100">
//               © 2026 SmartSupport. All rights reserved.
//             </p>

//           </div>
//         </div>

//         {/* ================= RIGHT SIDE ================= */}

//         <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">

//           <div className="w-full max-w-md">

//             {/* Mobile Logo */}

//             <div className="mb-10 flex items-center gap-3 lg:hidden">

//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
//                 <Headphones size={23} />
//               </div>

//               <div>
//                 <h1 className="font-bold">
//                   SmartSupport
//                 </h1>

//                 <p className="text-xs text-slate-400">
//                   AI Complaint Management
//                 </p>
//               </div>

//             </div>

//             {/* Heading */}

//             <div className="mb-8">

//               <h2 className="text-3xl font-bold tracking-tight">
//                 Welcome back
//               </h2>

//               <p className="mt-2 text-slate-400">
//                 Sign in to continue to your account.
//               </p>

//             </div>

//             {/* Error Message */}

//             {error && (
//               <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">

//                 <AlertCircle
//                   size={19}
//                   className="mt-0.5 shrink-0"
//                 />

//                 <span>{error}</span>

//               </div>
//             )}

//             {/* Login Form */}

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-5"
//             >

//               {/* Email */}

//               <div>

//                 <label
//                   htmlFor="email"
//                   className="mb-2 block text-sm font-medium text-slate-200"
//                 >
//                   Email Address
//                 </label>

//                 <div className="relative">

//                   <Mail
//                     size={19}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
//                   />

//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="Enter your email"
//                     autoComplete="email"
//                     className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
//                   />

//                 </div>

//               </div>

//               {/* Password */}

//               <div>

//                 <div className="mb-2 flex items-center justify-between">

//                   <label
//                     htmlFor="password"
//                     className="block text-sm font-medium text-slate-200"
//                   >
//                     Password
//                   </label>

//                   <button
//                     type="button"
//                     className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
//                   >
//                     Forgot password?
//                   </button>

//                 </div>

//                 <div className="relative">

//                   <Lock
//                     size={19}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
//                   />

//                   <input
//                     id="password"
//                     name="password"
//                     type={
//                       showPassword
//                         ? "text"
//                         : "password"
//                     }
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Enter your password"
//                     autoComplete="current-password"
//                     className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
//                   />

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setShowPassword((prev) => !prev)
//                     }
//                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
//                     aria-label={
//                       showPassword
//                         ? "Hide password"
//                         : "Show password"
//                     }
//                   >
//                     {showPassword ? (
//                       <EyeOff size={19} />
//                     ) : (
//                       <Eye size={19} />
//                     )}
//                   </button>

//                 </div>

//               </div>

//               {/* Login Button */}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
//               >

//                 {loading ? (
//                   <>
//                     <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

//                     Signing in...
//                   </>
//                 ) : (
//                   <>
//                     <LogIn size={19} />

//                     Sign In
//                   </>
//                 )}

//               </button>

//             </form>

//             {/* Register */}

//             <div className="mt-8 text-center text-sm text-slate-400">

//               Don't have an account?{" "}

//               <Link
//                 to="/register"
//                 className="font-semibold text-indigo-400 transition hover:text-indigo-300"
//               >
//                 Create account
//               </Link>

//             </div>

//             {/* Security */}

//             <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">

//               <ShieldCheck size={15} />

//               Your account is protected with secure authentication.

//             </div>

//           </div>

//         </div>

//       </div>
//     </div>
//   );
// }

// export default Login;