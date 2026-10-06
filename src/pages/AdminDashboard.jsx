
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Filter,
  X,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Loader2,
  CalendarDays,
} from "lucide-react";

import api from "../services/api";
import NotificationBell from "../components/NotificationBell";

function AdminDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [error, setError] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");

  const [assigning, setAssigning] = useState(false);

  // ==========================================
  // SEARCH + FILTER STATES
  // ==========================================

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // DATE FILTERS
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      const role = parsedUser.Role || parsedUser.role;

      if (role !== "Admin") {
        navigate("/dashboard");
        return;
      }

      setUser(parsedUser);

      loadComplaints();
      loadAgents();
      loadAnalytics();
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  }, [navigate]);

  // ==========================================
  // LOAD COMPLAINTS
  // ==========================================

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/Complaint");

      setComplaints(response.data || []);
    } catch (err) {
      console.error("Complaints error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD AGENTS
  // ==========================================

  const loadAgents = async () => {
    try {
      const response = await api.get("/User/agents");

      setAgents(response.data || []);
    } catch (err) {
      console.error("Agents error:", err);

      setAgents([]);
    }
  };

  // ==========================================
  // LOAD ANALYTICS
  // ==========================================

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError("");

      const response = await api.get(
        "/Analytics/dashboard"
      );

      setAnalytics(response.data || null);
    } catch (err) {
      console.error("Analytics error:", err);

      setAnalyticsError(
        err.response?.data?.message ||
          "Unable to load analytics."
      );
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ==========================================
  // ASSIGN COMPLAINT
  // ==========================================

  const handleAssign = async () => {
    if (!selectedComplaint) {
      return;
    }

    if (!selectedAgent) {
      alert("Please select a support agent.");
      return;
    }

    try {
      setAssigning(true);

      await api.put(
        `/Complaint/${selectedComplaint.id}/assign?agentId=${selectedAgent}`
      );

      alert("Complaint assigned successfully.");

      setSelectedComplaint(null);
      setSelectedAgent("");

      await loadComplaints();
      await loadAnalytics();
    } catch (err) {
      console.error("Assignment error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to assign complaint."
      );
    } finally {
      setAssigning(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

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

  // ==========================================
  // PRIORITY STYLE
  // ==========================================

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "text-red-500";

      case "High":
        return "text-orange-400";

      case "Medium":
        return "text-yellow-400";

      case "Low":
        return "text-green-400";

      default:
        return "text-slate-400";
    }
  };

  // ==========================================
  // FILTER COMPLAINTS
  // ==========================================

  const filteredComplaints = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const id =
        complaint.id ??
        complaint.Id;

      const title =
        complaint.title ??
        complaint.Title ??
        "";

      const description =
        complaint.description ??
        complaint.Description ??
        "";

      const customer =
        complaint.userName ??
        complaint.UserName ??
        "";

      const agent =
        complaint.assignedAgentName ??
        complaint.AssignedAgentName ??
        "";

      const status =
        complaint.status ??
        complaint.Status ??
        "";

      const priority =
        complaint.priority ??
        complaint.Priority ??
        "";

      const createdAt =
        complaint.createdAt ??
        complaint.CreatedAt;

      const complaintDate = createdAt
        ? new Date(createdAt)
        : null;

      const fromDate = dateFrom
        ? new Date(`${dateFrom}T00:00:00`)
        : null;

      const toDate = dateTo
        ? new Date(`${dateTo}T23:59:59`)
        : null;

      const matchesSearch =
        !search ||
        String(id)
          .toLowerCase()
          .includes(search) ||
        title
          .toLowerCase()
          .includes(search) ||
        description
          .toLowerCase()
          .includes(search) ||
        customer
          .toLowerCase()
          .includes(search) ||
        agent
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        priority === priorityFilter;

      const matchesDateFrom =
        !fromDate ||
        (complaintDate &&
          !Number.isNaN(complaintDate.getTime()) &&
          complaintDate >= fromDate);

      const matchesDateTo =
        !toDate ||
        (complaintDate &&
          !Number.isNaN(complaintDate.getTime()) &&
          complaintDate <= toDate);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    complaints,
    searchTerm,
    statusFilter,
    priorityFilter,
    dateFrom,
    dateTo,
  ]);

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "All" ||
    priorityFilter !== "All" ||
    dateFrom !== "" ||
    dateTo !== "";

  // ==========================================
  // ANALYTICS DATA
  // ==========================================

  const summary = analytics?.summary || {};

  const categoryStats =
    analytics?.categoryStats || [];

  const agentWorkload =
    analytics?.agentWorkload || [];

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ======================================
          NAVBAR
      ====================================== */}

      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-xl font-bold">
              SmartSupport
            </h1>

            <p className="text-xs text-slate-400">
              Admin Management Panel
            </p>
          </div>

          <div className="flex items-center gap-4">

            <NotificationBell />

            {user && (
              <div className="hidden text-right sm:block">

                <p className="text-sm font-semibold">
                  {user.Name || user.name}
                </p>

                <p className="text-xs text-cyan-400">
                  Admin
                </p>

              </div>
            )}

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm transition hover:bg-slate-700"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* PAGE HEADER */}

        <div className="mb-8">

          <div className="flex items-center gap-2 text-sm text-cyan-400">

            <BarChart3 size={17} />

            Administration

          </div>

          <h2 className="mt-1 text-3xl font-bold">
            Admin Dashboard
          </h2>

          <p className="mt-2 text-slate-400">
            Monitor complaints, analytics and
            support agent workload.
          </p>

        </div>

        {/* ==================================
            ERROR
        ================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ==================================
            ANALYTICS
        ================================== */}

        <section className="mb-8">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h3 className="text-xl font-semibold">
                Complaint Analytics
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Real-time complaint overview
              </p>

            </div>

            {analyticsLoading && (
              <Loader2
                size={20}
                className="animate-spin text-cyan-400"
              />
            )}

          </div>

          {analyticsError && (
            <div className="mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-400">
              {analyticsError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Total Complaints
                </p>

                <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                  <BarChart3 size={19} />
                </div>

              </div>

              <p className="mt-3 text-3xl font-bold">
                {summary.totalComplaints ??
                  complaints.length}
              </p>

            </div>

            {/* OPEN */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Open
                </p>

                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                  <Clock size={19} />
                </div>

              </div>

              <p className="mt-3 text-3xl font-bold text-blue-400">
                {summary.openComplaints ?? 0}
              </p>

            </div>

            {/* ASSIGNED */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Assigned
                </p>

                <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400">
                  <Users size={19} />
                </div>

              </div>

              <p className="mt-3 text-3xl font-bold text-purple-400">
                {summary.assignedComplaints ?? 0}
              </p>

            </div>

            {/* IN PROGRESS */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  In Progress
                </p>

                <div className="rounded-xl bg-yellow-500/10 p-2 text-yellow-400">
                  <TrendingUp size={19} />
                </div>

              </div>

              <p className="mt-3 text-3xl font-bold text-yellow-400">
                {summary.inProgressComplaints ?? 0}
              </p>

            </div>

            {/* RESOLVED */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Resolved
                </p>

                <div className="rounded-xl bg-green-500/10 p-2 text-green-400">
                  <CheckCircle2 size={19} />
                </div>

              </div>

              <p className="mt-3 text-3xl font-bold text-green-400">
                {summary.resolvedComplaints ?? 0}
              </p>

            </div>

            {/* CLOSED */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Closed
                </p>

                <div className="rounded-xl bg-slate-700/30 p-2 text-slate-400">
                  <CheckCircle2 size={19} />
                </div>

              </div>

              <p className="mt-3 text-3xl font-bold text-slate-300">
                {summary.closedComplaints ?? 0}
              </p>

            </div>

            {/* HIGH */}

            <div className="rounded-2xl border border-orange-500/20 bg-slate-900 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  High Priority
                </p>

                <div className="rounded-xl bg-orange-500/10 p-2 text-orange-400">
                  <AlertTriangle size={19} />
                </div>

              </div>

              <p className="mt-3 text-3xl font-bold text-orange-400">
                {summary.highPriorityComplaints ?? 0}
              </p>

            </div>

            {/* CRITICAL */}

            <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Critical
                </p>

                <div className="rounded-xl bg-red-500/10 p-2 text-red-500">
                  <AlertTriangle size={19} />
                </div>

              </div>

              <p className="mt-3 text-3xl font-bold text-red-500">
                {summary.criticalPriorityComplaints ?? 0}
              </p>

            </div>

          </div>

        </section>

        {/* ==================================
            CATEGORY + AGENT ANALYTICS
        ================================== */}

        <section className="mb-8 grid gap-6 lg:grid-cols-2">

          {/* CATEGORY */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5">

              <h3 className="text-lg font-semibold">
                Category Statistics
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Complaints grouped by category
              </p>

            </div>

            {categoryStats.length === 0 ? (

              <div className="py-8 text-center text-sm text-slate-500">
                No category data available.
              </div>

            ) : (

              <div className="space-y-4">

                {categoryStats.map(
                  (item, index) => {

                    const category =
                      item.category ??
                      item.Category;

                    const count =
                      item.count ??
                      item.Count ??
                      0;

                    const total =
                      summary.totalComplaints ||
                      1;

                    const percentage =
                      Math.round(
                        (count / total) * 100
                      );

                    return (
                      <div
                        key={`${category}-${index}`}
                      >

                        <div className="mb-2 flex items-center justify-between">

                          <span className="text-sm text-slate-300">
                            {category}
                          </span>

                          <span className="text-sm font-semibold text-cyan-400">
                            {count}
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                          <div
                            className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                        <p className="mt-1 text-right text-[11px] text-slate-600">
                          {percentage}%
                        </p>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

          {/* AGENT WORKLOAD */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5">

              <h3 className="text-lg font-semibold">
                Agent Workload
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Assigned complaints by support agent
              </p>

            </div>

            {agentWorkload.length === 0 ? (

              <div className="py-8 text-center text-sm text-slate-500">
                No agent workload data available.
              </div>

            ) : (

              <div className="space-y-4">

                {agentWorkload.map(
                  (agent, index) => {

                    const name =
                      agent.agent ??
                      agent.Agent ??
                      "Unknown Agent";

                    const totalAssigned =
                      agent.totalAssigned ??
                      agent.TotalAssigned ??
                      0;

                    const inProgress =
                      agent.inProgress ??
                      agent.InProgress ??
                      0;

                    const resolved =
                      agent.resolved ??
                      agent.Resolved ??
                      0;

                    return (
                      <div
                        key={`${name}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                              <Users size={17} />
                            </div>

                            <div>

                              <p className="text-sm font-semibold">
                                {name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {totalAssigned} total assigned
                              </p>

                            </div>

                          </div>

                          <span className="text-sm font-bold text-cyan-400">
                            {totalAssigned}
                          </span>

                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">

                          <div className="rounded-lg bg-yellow-500/5 px-3 py-2">

                            <p className="text-[11px] text-slate-500">
                              In Progress
                            </p>

                            <p className="mt-1 text-sm font-semibold text-yellow-400">
                              {inProgress}
                            </p>

                          </div>

                          <div className="rounded-lg bg-green-500/5 px-3 py-2">

                            <p className="text-[11px] text-slate-500">
                              Resolved
                            </p>

                            <p className="mt-1 text-sm font-semibold text-green-400">
                              {resolved}
                            </p>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </section>

        {/* ==================================
            COMPLAINT SEARCH + FILTERS
        ================================== */}

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="mb-5 flex items-center gap-2">

            <Filter
              size={19}
              className="text-cyan-400"
            />

            <div>

              <h3 className="font-semibold">
                Search & Filters
              </h3>

              <p className="text-xs text-slate-500">
                Find complaints quickly
              </p>

            </div>

          </div>

          {/* SEARCH + STATUS + PRIORITY */}

          <div className="grid gap-4 md:grid-cols-4">

            {/* SEARCH */}

            <div className="relative md:col-span-2">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search by ID, title, customer or agent..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
              />

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            >

              <option value="All">
                All Statuses
              </option>

              <option value="Open">
                Open
              </option>

              <option value="Assigned">
                Assigned
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>

              <option value="Closed">
                Closed
              </option>

            </select>

            {/* PRIORITY */}

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            >

              <option value="All">
                All Priorities
              </option>

              <option value="Critical">
                Critical
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>

            </select>

          </div>

          {/* DATE FILTERS */}

          <div className="mt-4 grid gap-4 md:grid-cols-3">

            {/* FROM DATE */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">

                <CalendarDays
                  size={16}
                  className="text-cyan-400"
                />

                From Date

              </label>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) =>
                  setDateFrom(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              />

            </div>

            {/* TO DATE */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">

                <CalendarDays
                  size={16}
                  className="text-cyan-400"
                />

                To Date

              </label>

              <input
                type="date"
                value={dateTo}
                onChange={(e) =>
                  setDateTo(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              />

            </div>

            {/* DATE INFO */}

            <div className="flex items-end">

              <div className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">

                <p className="text-xs text-slate-500">
                  Date filter
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  Filter by complaint creation date
                </p>

              </div>

            </div>

          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

            <p className="text-xs text-slate-500">

              Showing{" "}

              <span className="font-semibold text-slate-300">
                {filteredComplaints.length}
              </span>

              {" "}of{" "}

              <span className="font-semibold text-slate-300">
                {complaints.length}
              </span>

              {" "}complaints

            </p>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-red-500/30 hover:text-red-400"
              >

                <X size={14} />

                Clear Filters

              </button>
            )}

          </div>

        </section>

        {/* ==================================
            COMPLAINT TABLE
        ================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 px-6 py-5">

            <h3 className="text-lg font-semibold">
              All Complaints
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              View, search and manage customer complaints.
            </p>

          </div>

          {loading ? (

            <div className="flex items-center justify-center gap-3 px-6 py-12 text-slate-400">

              <Loader2
                size={20}
                className="animate-spin text-cyan-400"
              />

              Loading complaints...

            </div>

          ) : filteredComplaints.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <Search
                size={32}
                className="mx-auto text-slate-700"
              />

              <p className="mt-3 text-sm text-slate-400">
                No complaints match your filters.
              </p>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-cyan-400 hover:text-cyan-300"
                >
                  Clear filters
                </button>
              )}

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

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Agent
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800">

                  {filteredComplaints.map(
                    (complaint) => {

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

                      const agent =
                        complaint.assignedAgentName ??
                        complaint.AssignedAgentName;

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

                          <td className="px-6 py-5 text-sm text-slate-300">
                            {customer || "Unknown"}
                          </td>

                          <td className="px-6 py-5 text-sm font-medium">

                            <span
                              className={getPriorityClass(
                                priority
                              )}
                            >
                              {priority}
                            </span>

                          </td>

                          <td className="px-6 py-5">

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs ${getStatusClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>

                          </td>

                          <td className="px-6 py-5 text-sm text-slate-300">
                            {agent || "Not assigned"}
                          </td>

                          <td className="px-6 py-5 text-right">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  navigate(
                                    `/complaints/${id}`
                                  )
                                }
                                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                              >
                                View
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedComplaint({
                                    id,
                                    title,
                                  });

                                  setSelectedAgent("");
                                }}
                                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                              >
                                Assign
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </main>

      {/* ======================================
          ASSIGN MODAL
      ====================================== */}

      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <h3 className="text-xl font-bold">
              Assign Complaint
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Complaint #{selectedComplaint.id}
            </p>

            <p className="mt-1 text-sm font-medium text-white">
              {selectedComplaint.title}
            </p>

            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Select Support Agent
              </label>

              <select
                value={selectedAgent}
                onChange={(e) =>
                  setSelectedAgent(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
              >

                <option value="">
                  Select agent
                </option>

                {agents.map((agent) => (
                  <option
                    key={
                      agent.id ??
                      agent.Id
                    }
                    value={
                      agent.id ??
                      agent.Id
                    }
                  >
                    {agent.name ??
                      agent.Name}{" "}
                    -{" "}
                    {agent.email ??
                      agent.Email}
                  </option>
                ))}

              </select>

              {agents.length === 0 && (
                <p className="mt-2 text-xs text-yellow-400">
                  No support agents found.
                </p>
              )}

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setSelectedAgent("");
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleAssign}
                disabled={
                  assigning ||
                  !selectedAgent
                }
                className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning
                  ? "Assigning..."
                  : "Assign Complaint"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminDashboard;














