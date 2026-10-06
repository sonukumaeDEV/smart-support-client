

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  Loader2,
  User,
  Sparkles,
  Copy,
} from "lucide-react";

import api from "../services/api";

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    loadComplaint();
    loadComments();
  }, [id]);

  // ==========================================
  // LOAD COMPLAINT
  // ==========================================

  const loadComplaint = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/Complaint/${id}`);

      setComplaint(response.data);
    } catch (err) {
      console.error("Complaint details error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view this complaint."
        );
      } else if (err.response?.status === 404) {
        setError("Complaint not found.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load complaint details."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD COMMENTS
  // ==========================================

  const loadComments = async () => {
    try {
      setCommentsLoading(true);

      const response = await api.get(
        `/Comment/complaint/${id}`
      );

      setComments(response.data || []);
    } catch (err) {
      console.error("Comments error:", err);

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view these comments."
        );
      }
    } finally {
      setCommentsLoading(false);
    }
  };

  // ==========================================
  // USE AI RESPONSE
  // ==========================================

  const handleUseAIResponse = () => {
    if (!aiSuggestedResponse) {
      setError(
        "AI suggested response is not available."
      );

      return;
    }

    setCommentText(aiSuggestedResponse);
    setError("");

    setSuccess(
      "AI response added to the reply box. You can edit it before sending."
    );

    // Scroll to comment box
    setTimeout(() => {
      const commentBox =
        document.getElementById("comment-box");

      if (commentBox) {
        commentBox.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  // ==========================================
  // ADD COMMENT
  // ==========================================

  const handleAddComment = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!commentText.trim()) {
      setError("Please enter a comment.");
      return;
    }

    try {
      setSubmittingComment(true);

      const response = await api.post(
        `/Comment/complaint/${id}`,
        {
          message: commentText.trim(),
        }
      );

      setCommentText("");

      setSuccess(
        response.data?.message ||
          "Comment added successfully."
      );

      await loadComments();
      await loadComplaint();
    } catch (err) {
      console.error("Add comment error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/Comment/complaint/${id}/status`,
        null,
        {
          params: {
            status: newStatus,
          },
        }
      );

      setSuccess(
        response.data?.message ||
          "Complaint status updated successfully."
      );

      await loadComplaint();
    } catch (err) {
      console.error("Status update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update complaint status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ==========================================
  // BACK BUTTON
  // ==========================================

  const handleBack = () => {
    const storedUser = localStorage.getItem("user");

    try {
      const user = JSON.parse(
        storedUser || "{}"
      );

      const role =
        user?.role ||
        user?.Role;

      if (role === "SupportAgent") {
        navigate("/agent");
      } else if (role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch {
      navigate("/dashboard");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400"></div>

          <p className="text-slate-400">
            Loading complaint...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !complaint) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={handleBack}
            className="mb-6 text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Back
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h2 className="text-lg font-semibold text-red-400">
              Error
            </h2>

            <p className="mt-2 text-sm text-red-300">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  // ==========================================
  // COMPLAINT DATA
  // ==========================================

  const complaintId =
    complaint.id ??
    complaint.Id;

  const status =
    complaint.status ??
    complaint.Status ??
    "Open";

  const priority =
    complaint.priority ??
    complaint.Priority ??
    "Medium";

  const title =
    complaint.title ??
    complaint.Title ??
    "Untitled Complaint";

  const description =
    complaint.description ??
    complaint.Description ??
    "";

  const sentiment =
    complaint.sentiment ??
    complaint.Sentiment;

  const aiCategory =
    complaint.ai_Category ??
    complaint.aI_Category ??
    complaint.AI_Category ??
    complaint.aiCategory;

  const aiSummary =
    complaint.ai_Summary ??
    complaint.aI_Summary ??
    complaint.AI_Summary ??
    complaint.aiSummary;

  const aiSuggestedResponse =
    complaint.ai_SuggestedResponse ??
    complaint.aI_SuggestedResponse ??
    complaint.AI_SuggestedResponse ??
    complaint.aiSuggestedResponse ??
    complaint.ai_Suggested_Response ??
    complaint.AI_Suggested_Response;

  const categoryName =
    complaint.categoryName ??
    complaint.CategoryName;

  const assignedAgentName =
    complaint.assignedAgentName ??
    complaint.AssignedAgentName;

  const createdAt =
    complaint.createdAt ??
    complaint.CreatedAt;

  const updatedAt =
    complaint.updatedAt ??
    complaint.UpdatedAt;

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = () => {
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
  // PRIORITY CLASS
  // ==========================================

  const getPriorityClass = () => {
    switch (priority) {
      case "High":
      case "Critical":
        return "text-red-400";

      case "Medium":
        return "text-yellow-400";

      case "Low":
        return "text-green-400";

      default:
        return "text-slate-400";
    }
  };

  // ==========================================
  // GET USER ROLE
  // ==========================================

  let userRole = "Customer";

  try {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    userRole =
      storedUser?.role ||
      storedUser?.Role ||
      "Customer";
  } catch {
    userRole = "Customer";
  }

  const canManageStatus =
    userRole === "SupportAgent" ||
    userRole === "Admin";

  const canUseAIResponse =
    userRole === "SupportAgent" ||
    userRole === "Admin";

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
              Complaint Details
            </p>
          </div>

          <button
            onClick={handleBack}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
          >
            ← Back
          </button>

        </div>
      </nav>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}

        <div className="mb-6">

          <p className="mb-2 text-sm text-cyan-400">
            Complaint #{complaintId}
          </p>

          <h2 className="text-3xl font-bold">
            {title}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-3">

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass()}`}
            >
              {status}
            </span>

            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
              Priority:{" "}
              <span className={getPriorityClass()}>
                {priority}
              </span>
            </span>

            {categoryName && (
              <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {categoryName}
              </span>
            )}

          </div>
        </div>

        {/* SUCCESS MESSAGE */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ==================================
              LEFT SIDE
          ================================== */}

          <div className="space-y-6 lg:col-span-2">

            {/* COMPLAINT DESCRIPTION */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <h3 className="text-lg font-semibold">
                Complaint Description
              </h3>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-5">

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {description}
                </p>

              </div>

            </div>

            {/* ==================================
                GEMINI AI ANALYSIS
            ================================== */}

            <div className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
                  🤖
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    Gemini AI Analysis
                  </h3>

                  <p className="text-xs text-slate-400">
                    AI-powered complaint analysis
                  </p>
                </div>

              </div>

              {/* AI CARDS */}

              <div className="mt-6 grid gap-4 sm:grid-cols-3">

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <p className="text-xs text-slate-500">
                    AI Category
                  </p>

                  <p className="mt-2 font-semibold text-cyan-400">
                    {aiCategory || "Not available"}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <p className="text-xs text-slate-500">
                    Sentiment
                  </p>

                  <p className="mt-2 font-semibold text-purple-400">
                    {sentiment || "Not available"}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <p className="text-xs text-slate-500">
                    Priority
                  </p>

                  <p
                    className={`mt-2 font-semibold ${getPriorityClass()}`}
                  >
                    {priority}
                  </p>

                </div>

              </div>

              {/* AI SUMMARY */}

              <div className="mt-5">

                <p className="mb-2 text-sm font-semibold text-slate-300">
                  AI Summary
                </p>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

                  <p className="text-sm leading-7 text-slate-300">
                    {aiSummary ||
                      "AI summary not available."}
                  </p>

                </div>

              </div>

              {/* AI SUGGESTED RESPONSE */}

              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between gap-3">

                  <div className="flex items-center gap-2">

                    <Sparkles
                      size={17}
                      className="text-cyan-400"
                    />

                    <p className="text-sm font-semibold text-slate-300">
                      AI Suggested Response
                    </p>

                  </div>

                  {canUseAIResponse &&
                    aiSuggestedResponse && (
                      <button
                        type="button"
                        onClick={handleUseAIResponse}
                        className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/20 hover:text-cyan-300"
                      >
                        <Copy size={14} />

                        Use AI Response
                      </button>
                    )}

                </div>

                <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-5">

                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {aiSuggestedResponse ||
                      "AI suggested response not available."}
                  </p>

                </div>

              </div>

            </div>

            {/* ==================================
                COMMENTS
            ================================== */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900">

              <div className="border-b border-slate-800 px-6 py-5">

                <h3 className="flex items-center gap-2 text-lg font-semibold">

                  <MessageSquare
                    size={20}
                    className="text-cyan-400"
                  />

                  Comments

                  <span className="text-sm font-normal text-slate-500">
                    ({comments.length})
                  </span>

                </h3>

              </div>

              <div className="p-6">

                {/* COMMENT LIST */}

                {commentsLoading ? (

                  <div className="py-8 text-center">

                    <Loader2
                      size={28}
                      className="mx-auto animate-spin text-cyan-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading comments...
                    </p>

                  </div>

                ) : comments.length === 0 ? (

                  <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">

                    <MessageSquare
                      size={32}
                      className="mx-auto text-slate-600"
                    />

                    <p className="mt-3 text-sm text-slate-400">
                      No comments yet.
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Add the first support response below.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {comments.map((comment) => {

                      const commentId =
                        comment.id ??
                        comment.Id;

                      const commentMessage =
                        comment.message ??
                        comment.Message;

                      const commentUser =
                        comment.userName ??
                        comment.UserName ??
                        "Unknown";

                      const commentRole =
                        comment.userRole ??
                        comment.UserRole ??
                        "";

                      const commentDate =
                        comment.createdAt ??
                        comment.CreatedAt;

                      return (
                        <div
                          key={commentId}
                          className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10">

                                <User
                                  size={17}
                                  className="text-cyan-400"
                                />

                              </div>

                              <div>

                                <p className="text-sm font-semibold">
                                  {commentUser}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {commentRole}
                                </p>

                              </div>

                            </div>

                            <span className="text-right text-xs text-slate-600">
                              {commentDate
                                ? new Date(
                                    commentDate
                                  ).toLocaleString()
                                : ""}
                            </span>

                          </div>

                          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                            {commentMessage}
                          </p>

                        </div>
                      );
                    })}

                  </div>
                )}

                {/* ADD COMMENT */}

                <form
                  id="comment-box"
                  onSubmit={handleAddComment}
                  className="mt-6 border-t border-slate-800 pt-6"
                >

                  <div className="mb-2 flex items-center justify-between">

                    <label className="block text-sm font-medium text-slate-300">
                      Add Comment / Response
                    </label>

                    {canUseAIResponse &&
                      aiSuggestedResponse && (
                        <button
                          type="button"
                          onClick={handleUseAIResponse}
                          className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
                        >
                          <Sparkles size={14} />

                          Fill with AI
                        </button>
                      )}

                  </div>

                  <textarea
                    value={commentText}
                    onChange={(e) =>
                      setCommentText(e.target.value)
                    }
                    rows={5}
                    placeholder="Write your response to the customer..."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
                  />

                  <div className="mt-3 flex items-center justify-between gap-3">

                    {commentText && (
                      <p className="text-xs text-slate-600">
                        You can edit the AI response before sending.
                      </p>
                    )}

                    <div className="ml-auto">

                      <button
                        type="submit"
                        disabled={submittingComment}
                        className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {submittingComment ? (
                          <>
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />

                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={17} />

                            Add Comment
                          </>
                        )}

                      </button>

                    </div>

                  </div>

                </form>

              </div>

            </div>

          </div>

          {/* ==================================
              RIGHT SIDE
          ================================== */}

          <div className="space-y-6">

            {/* ==================================
                STATUS CONTROL
            ================================== */}

            {canManageStatus && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h3 className="text-lg font-semibold">
                  Update Status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Manage the complaint workflow.
                </p>

                <div className="mt-5 space-y-3">

                  {/* ASSIGNED */}

                  <button
                    onClick={() =>
                      handleStatusUpdate("Assigned")
                    }
                    disabled={
                      updatingStatus ||
                      status === "Assigned"
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <span className="flex items-center gap-2">

                      <Clock size={17} />

                      Assigned

                    </span>

                    {status === "Assigned" && (
                      <CheckCircle2 size={17} />
                    )}

                  </button>

                  {/* IN PROGRESS */}

                  <button
                    onClick={() =>
                      handleStatusUpdate("In Progress")
                    }
                    disabled={
                      updatingStatus ||
                      status === "In Progress"
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-300 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <span className="flex items-center gap-2">

                      <RefreshCw size={17} />

                      In Progress

                    </span>

                    {status === "In Progress" && (
                      <CheckCircle2 size={17} />
                    )}

                  </button>

                  {/* RESOLVED */}

                  <button
                    onClick={() =>
                      handleStatusUpdate("Resolved")
                    }
                    disabled={
                      updatingStatus ||
                      status === "Resolved"
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-300 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <span className="flex items-center gap-2">

                      <CheckCircle2 size={17} />

                      Resolved

                    </span>

                    {status === "Resolved" && (
                      <CheckCircle2 size={17} />
                    )}

                  </button>

                </div>

              </div>
            )}

            {/* ==================================
                COMPLAINT INFORMATION
            ================================== */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <h3 className="text-lg font-semibold">
                Complaint Information
              </h3>

              <div className="mt-5 space-y-5">

                <div>

                  <p className="text-xs text-slate-500">
                    Complaint ID
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    #{complaintId}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {status}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Priority
                  </p>

                  <p
                    className={`mt-1 text-sm font-medium ${getPriorityClass()}`}
                  >
                    {priority}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {categoryName || "Not assigned"}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Assigned Agent
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {assignedAgentName || "Not assigned"}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Created
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {createdAt
                      ? new Date(
                          createdAt
                        ).toLocaleString()
                      : "N/A"}
                  </p>

                </div>

                {updatedAt && (
                  <div>

                    <p className="text-xs text-slate-500">
                      Last Updated
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {new Date(
                        updatedAt
                      ).toLocaleString()}
                    </p>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default ComplaintDetails;










// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   MessageSquare,
//   Send,
//   RefreshCw,
//   CheckCircle2,
//   Clock,
//   Loader2,
//   User,
// } from "lucide-react";

// import api from "../services/api";

// function ComplaintDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [complaint, setComplaint] = useState(null);
//   const [comments, setComments] = useState([]);

//   const [commentText, setCommentText] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [commentsLoading, setCommentsLoading] = useState(true);
//   const [submittingComment, setSubmittingComment] = useState(false);
//   const [updatingStatus, setUpdatingStatus] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // ==========================================
//   // LOAD DATA
//   // ==========================================

//   useEffect(() => {
//     loadComplaint();
//     loadComments();
//   }, [id]);

//   // ==========================================
//   // LOAD COMPLAINT
//   // ==========================================

//   const loadComplaint = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get(`/Complaint/${id}`);

//       setComplaint(response.data);
//     } catch (err) {
//       console.error("Complaint details error:", err);

//       if (err.response?.status === 401) {
//         setError(
//           "Your session has expired. Please login again."
//         );
//       } else if (err.response?.status === 403) {
//         setError(
//           "You do not have permission to view this complaint."
//         );
//       } else if (err.response?.status === 404) {
//         setError("Complaint not found.");
//       } else {
//         setError(
//           err.response?.data?.message ||
//             "Unable to load complaint details."
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================================
//   // LOAD COMMENTS
//   // ==========================================

//   const loadComments = async () => {
//     try {
//       setCommentsLoading(true);

//       const response = await api.get(
//         `/Comment/complaint/${id}`
//       );

//       setComments(response.data || []);
//     } catch (err) {
//       console.error("Comments error:", err);

//       if (err.response?.status === 403) {
//         setError(
//           "You do not have permission to view these comments."
//         );
//       }
//     } finally {
//       setCommentsLoading(false);
//     }
//   };

//   // ==========================================
//   // ADD COMMENT
//   // ==========================================

//   const handleAddComment = async (e) => {
//     e.preventDefault();

//     setError("");
//     setSuccess("");

//     if (!commentText.trim()) {
//       setError("Please enter a comment.");
//       return;
//     }

//     try {
//       setSubmittingComment(true);

//       const response = await api.post(
//         `/Comment/complaint/${id}`,
//         {
//           message: commentText.trim(),
//         }
//       );

//       setCommentText("");

//       setSuccess(
//         response.data?.message ||
//           "Comment added successfully."
//       );

//       await loadComments();
//       await loadComplaint();
//     } catch (err) {
//       console.error("Add comment error:", err);

//       setError(
//         err.response?.data?.message ||
//           "Unable to add comment."
//       );
//     } finally {
//       setSubmittingComment(false);
//     }
//   };

//   // ==========================================
//   // UPDATE STATUS
//   // ==========================================

//   const handleStatusUpdate = async (newStatus) => {
//     try {
//       setUpdatingStatus(true);
//       setError("");
//       setSuccess("");

//       const response = await api.put(
//         `/Comment/complaint/${id}/status`,
//         null,
//         {
//           params: {
//             status: newStatus,
//           },
//         }
//       );

//       setSuccess(
//         response.data?.message ||
//           "Complaint status updated successfully."
//       );

//       await loadComplaint();
//     } catch (err) {
//       console.error("Status update error:", err);

//       setError(
//         err.response?.data?.message ||
//           "Unable to update complaint status."
//       );
//     } finally {
//       setUpdatingStatus(false);
//     }
//   };

//   // ==========================================
//   // BACK BUTTON
//   // ==========================================

//   const handleBack = () => {
//     const storedUser = localStorage.getItem("user");

//     try {
//       const user = JSON.parse(storedUser || "{}");

//       const role = user?.role || user?.Role;

//       if (role === "SupportAgent") {
//         navigate("/agent");
//       } else if (role === "Admin") {
//         navigate("/admin");
//       } else {
//         navigate("/dashboard");
//       }
//     } catch {
//       navigate("/dashboard");
//     }
//   };

//   // ==========================================
//   // LOADING
//   // ==========================================

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
//         <div className="text-center">
//           <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400"></div>

//           <p className="text-slate-400">
//             Loading complaint...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ==========================================
//   // ERROR
//   // ==========================================

//   if (error && !complaint) {
//     return (
//       <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
//         <div className="mx-auto max-w-3xl">
//           <button
//             onClick={handleBack}
//             className="mb-6 text-sm text-cyan-400 hover:text-cyan-300"
//           >
//             ← Back
//           </button>

//           <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
//             <h2 className="text-lg font-semibold text-red-400">
//               Error
//             </h2>

//             <p className="mt-2 text-sm text-red-300">
//               {error}
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!complaint) {
//     return null;
//   }

//   // ==========================================
//   // COMPLAINT DATA
//   // ==========================================

//   const complaintId =
//     complaint.id ?? complaint.Id;

//   const status =
//     complaint.status ?? complaint.Status ?? "Open";

//   const priority =
//     complaint.priority ??
//     complaint.Priority ??
//     "Medium";

//   const title =
//     complaint.title ??
//     complaint.Title ??
//     "Untitled Complaint";

//   const description =
//     complaint.description ??
//     complaint.Description ??
//     "";

//   const sentiment =
//     complaint.sentiment ??
//     complaint.Sentiment;

//   const aiCategory =
//     complaint.ai_Category ??
//     complaint.aI_Category ??
//     complaint.AI_Category ??
//     complaint.aiCategory;

//   const aiSummary =
//     complaint.ai_Summary ??
//     complaint.aI_Summary ??
//     complaint.AI_Summary ??
//     complaint.aiSummary;

//   const aiSuggestedResponse =
//     complaint.ai_SuggestedResponse ??
//     complaint.aI_SuggestedResponse ??
//     complaint.AI_SuggestedResponse ??
//     complaint.aiSuggestedResponse;

//   const categoryName =
//     complaint.categoryName ??
//     complaint.CategoryName;

//   const assignedAgentName =
//     complaint.assignedAgentName ??
//     complaint.AssignedAgentName;

//   const createdAt =
//     complaint.createdAt ??
//     complaint.CreatedAt;

//   const updatedAt =
//     complaint.updatedAt ??
//     complaint.UpdatedAt;

//   // ==========================================
//   // STATUS CLASS
//   // ==========================================

//   const getStatusClass = () => {
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

//   // ==========================================
//   // PRIORITY CLASS
//   // ==========================================

//   const getPriorityClass = () => {
//     switch (priority) {
//       case "High":
//       case "Critical":
//         return "text-red-400";

//       case "Medium":
//         return "text-yellow-400";

//       case "Low":
//         return "text-green-400";

//       default:
//         return "text-slate-400";
//     }
//   };

//   // ==========================================
//   // GET USER ROLE
//   // ==========================================

//   let userRole = "Customer";

//   try {
//     const storedUser = JSON.parse(
//       localStorage.getItem("user") || "{}"
//     );

//     userRole =
//       storedUser?.role ||
//       storedUser?.Role ||
//       "Customer";
//   } catch {
//     userRole = "Customer";
//   }

//   const canManageStatus =
//     userRole === "SupportAgent" ||
//     userRole === "Admin";

//   // ==========================================
//   // UI
//   // ==========================================

//   return (
//     <div className="min-h-screen bg-slate-950 text-white">

//       {/* ======================================
//           NAVBAR
//       ====================================== */}

//       <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

//           <div>
//             <h1 className="text-xl font-bold">
//               SmartSupport
//             </h1>

//             <p className="text-xs text-slate-400">
//               Complaint Details
//             </p>
//           </div>

//           <button
//             onClick={handleBack}
//             className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
//           >
//             ← Back
//           </button>

//         </div>
//       </nav>

//       {/* ======================================
//           MAIN
//       ====================================== */}

//       <main className="mx-auto max-w-7xl px-6 py-8">

//         {/* HEADER */}

//         <div className="mb-6">

//           <p className="mb-2 text-sm text-cyan-400">
//             Complaint #{complaintId}
//           </p>

//           <h2 className="text-3xl font-bold">
//             {title}
//           </h2>

//           <div className="mt-4 flex flex-wrap items-center gap-3">

//             <span
//               className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass()}`}
//             >
//               {status}
//             </span>

//             <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">

//               Priority:{" "}

//               <span className={getPriorityClass()}>
//                 {priority}
//               </span>

//             </span>

//             {categoryName && (
//               <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
//                 {categoryName}
//               </span>
//             )}

//           </div>
//         </div>

//         {/* SUCCESS MESSAGE */}

//         {success && (
//           <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
//             {success}
//           </div>
//         )}

//         {/* ERROR MESSAGE */}

//         {error && (
//           <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
//             {error}
//           </div>
//         )}

//         <div className="grid gap-6 lg:grid-cols-3">

//           {/* ==================================
//               LEFT SIDE
//           ================================== */}

//           <div className="space-y-6 lg:col-span-2">

//             {/* COMPLAINT DESCRIPTION */}

//             <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

//               <h3 className="text-lg font-semibold">
//                 Complaint Description
//               </h3>

//               <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-5">

//                 <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
//                   {description}
//                 </p>

//               </div>
//             </div>

//             {/* ==================================
//                 GEMINI AI ANALYSIS
//             ================================== */}

//             <div className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">

//               <div className="flex items-center gap-3">

//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
//                   🤖
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-semibold">
//                     Gemini AI Analysis
//                   </h3>

//                   <p className="text-xs text-slate-400">
//                     AI-powered complaint analysis
//                   </p>
//                 </div>

//               </div>

//               {/* AI CARDS */}

//               <div className="mt-6 grid gap-4 sm:grid-cols-3">

//                 <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

//                   <p className="text-xs text-slate-500">
//                     AI Category
//                   </p>

//                   <p className="mt-2 font-semibold text-cyan-400">
//                     {aiCategory || "Not available"}
//                   </p>

//                 </div>

//                 <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

//                   <p className="text-xs text-slate-500">
//                     Sentiment
//                   </p>

//                   <p className="mt-2 font-semibold text-purple-400">
//                     {sentiment || "Not available"}
//                   </p>

//                 </div>

//                 <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

//                   <p className="text-xs text-slate-500">
//                     Priority
//                   </p>

//                   <p
//                     className={`mt-2 font-semibold ${getPriorityClass()}`}
//                   >
//                     {priority}
//                   </p>

//                 </div>

//               </div>

//               {/* AI SUMMARY */}

//               <div className="mt-5">

//                 <p className="mb-2 text-sm font-semibold text-slate-300">
//                   AI Summary
//                 </p>

//                 <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

//                   <p className="text-sm leading-7 text-slate-300">
//                     {aiSummary ||
//                       "AI summary not available."}
//                   </p>

//                 </div>

//               </div>

//               {/* AI SUGGESTED RESPONSE */}

//               <div className="mt-5">

//                 <p className="mb-2 text-sm font-semibold text-slate-300">
//                   AI Suggested Response
//                 </p>

//                 <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-5">

//                   <p className="text-sm leading-7 text-slate-300">
//                     {aiSuggestedResponse ||
//                       "AI suggested response not available."}
//                   </p>

//                 </div>

//               </div>

//             </div>

//             {/* ==================================
//                 COMMENTS
//             ================================== */}

//             <div className="rounded-2xl border border-slate-800 bg-slate-900">

//               <div className="border-b border-slate-800 px-6 py-5">

//                 <h3 className="flex items-center gap-2 text-lg font-semibold">

//                   <MessageSquare
//                     size={20}
//                     className="text-cyan-400"
//                   />

//                   Comments

//                   <span className="text-sm font-normal text-slate-500">
//                     ({comments.length})
//                   </span>

//                 </h3>

//               </div>

//               <div className="p-6">

//                 {/* COMMENT LIST */}

//                 {commentsLoading ? (

//                   <div className="py-8 text-center">

//                     <Loader2
//                       size={28}
//                       className="mx-auto animate-spin text-cyan-400"
//                     />

//                     <p className="mt-3 text-sm text-slate-500">
//                       Loading comments...
//                     </p>

//                   </div>

//                 ) : comments.length === 0 ? (

//                   <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">

//                     <MessageSquare
//                       size={32}
//                       className="mx-auto text-slate-600"
//                     />

//                     <p className="mt-3 text-sm text-slate-400">
//                       No comments yet.
//                     </p>

//                     <p className="mt-1 text-xs text-slate-600">
//                       Add the first support response below.
//                     </p>

//                   </div>

//                 ) : (

//                   <div className="space-y-4">

//                     {comments.map((comment) => {

//                       const commentId =
//                         comment.id ??
//                         comment.Id;

//                       const commentMessage =
//                         comment.message ??
//                         comment.Message;

//                       const commentUser =
//                         comment.userName ??
//                         comment.UserName ??
//                         "Unknown";

//                       const commentRole =
//                         comment.userRole ??
//                         comment.UserRole ??
//                         "";

//                       const commentDate =
//                         comment.createdAt ??
//                         comment.CreatedAt;

//                       return (
//                         <div
//                           key={commentId}
//                           className="rounded-xl border border-slate-800 bg-slate-950 p-4"
//                         >

//                           <div className="flex items-start justify-between gap-4">

//                             <div className="flex items-center gap-3">

//                               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10">

//                                 <User
//                                   size={17}
//                                   className="text-cyan-400"
//                                 />

//                               </div>

//                               <div>

//                                 <p className="text-sm font-semibold">
//                                   {commentUser}
//                                 </p>

//                                 <p className="text-xs text-slate-500">
//                                   {commentRole}
//                                 </p>

//                               </div>

//                             </div>

//                             <span className="text-right text-xs text-slate-600">
//                               {commentDate
//                                 ? new Date(
//                                     commentDate
//                                   ).toLocaleString()
//                                 : ""}
//                             </span>

//                           </div>

//                           <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
//                             {commentMessage}
//                           </p>

//                         </div>
//                       );
//                     })}

//                   </div>
//                 )}

//                 {/* ADD COMMENT */}

//                 <form
//                   onSubmit={handleAddComment}
//                   className="mt-6 border-t border-slate-800 pt-6"
//                 >

//                   <label className="mb-2 block text-sm font-medium text-slate-300">
//                     Add Comment / Response
//                   </label>

//                   <textarea
//                     value={commentText}
//                     onChange={(e) =>
//                       setCommentText(e.target.value)
//                     }
//                     rows={4}
//                     placeholder="Write your response to the customer..."
//                     className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
//                   />

//                   <div className="mt-3 flex justify-end">

//                     <button
//                       type="submit"
//                       disabled={submittingComment}
//                       className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
//                     >

//                       {submittingComment ? (
//                         <>
//                           <Loader2
//                             size={17}
//                             className="animate-spin"
//                           />

//                           Sending...
//                         </>
//                       ) : (
//                         <>
//                           <Send size={17} />

//                           Add Comment
//                         </>
//                       )}

//                     </button>

//                   </div>

//                 </form>

//               </div>

//             </div>

//           </div>

//           {/* ==================================
//               RIGHT SIDE
//           ================================== */}

//           <div className="space-y-6">

//             {/* ==================================
//                 STATUS CONTROL
//             ================================== */}

//             {canManageStatus && (
//               <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

//                 <h3 className="text-lg font-semibold">
//                   Update Status
//                 </h3>

//                 <p className="mt-1 text-sm text-slate-500">
//                   Manage the complaint workflow.
//                 </p>

//                 <div className="mt-5 space-y-3">

//                   {/* ASSIGNED */}

//                   <button
//                     onClick={() =>
//                       handleStatusUpdate("Assigned")
//                     }
//                     disabled={
//                       updatingStatus ||
//                       status === "Assigned"
//                     }
//                     className="flex w-full items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40"
//                   >

//                     <span className="flex items-center gap-2">

//                       <Clock size={17} />

//                       Assigned

//                     </span>

//                     {status === "Assigned" && (
//                       <CheckCircle2 size={17} />
//                     )}

//                   </button>

//                   {/* IN PROGRESS */}

//                   <button
//                     onClick={() =>
//                       handleStatusUpdate("In Progress")
//                     }
//                     disabled={
//                       updatingStatus ||
//                       status === "In Progress"
//                     }
//                     className="flex w-full items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-300 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-40"
//                   >

//                     <span className="flex items-center gap-2">

//                       <RefreshCw size={17} />

//                       In Progress

//                     </span>

//                     {status === "In Progress" && (
//                       <CheckCircle2 size={17} />
//                     )}

//                   </button>

//                   {/* RESOLVED */}

//                   <button
//                     onClick={() =>
//                       handleStatusUpdate("Resolved")
//                     }
//                     disabled={
//                       updatingStatus ||
//                       status === "Resolved"
//                     }
//                     className="flex w-full items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-300 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-40"
//                   >

//                     <span className="flex items-center gap-2">

//                       <CheckCircle2 size={17} />

//                       Resolved

//                     </span>

//                     {status === "Resolved" && (
//                       <CheckCircle2 size={17} />
//                     )}

//                   </button>

//                 </div>

//               </div>
//             )}

//             {/* ==================================
//                 COMPLAINT INFORMATION
//             ================================== */}

//             <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

//               <h3 className="text-lg font-semibold">
//                 Complaint Information
//               </h3>

//               <div className="mt-5 space-y-5">

//                 <div>

//                   <p className="text-xs text-slate-500">
//                     Complaint ID
//                   </p>

//                   <p className="mt-1 text-sm font-medium">
//                     #{complaintId}
//                   </p>

//                 </div>

//                 <div>

//                   <p className="text-xs text-slate-500">
//                     Status
//                   </p>

//                   <p className="mt-1 text-sm font-medium">
//                     {status}
//                   </p>

//                 </div>

//                 <div>

//                   <p className="text-xs text-slate-500">
//                     Priority
//                   </p>

//                   <p
//                     className={`mt-1 text-sm font-medium ${getPriorityClass()}`}
//                   >
//                     {priority}
//                   </p>

//                 </div>

//                 <div>

//                   <p className="text-xs text-slate-500">
//                     Category
//                   </p>

//                   <p className="mt-1 text-sm font-medium">
//                     {categoryName || "Not assigned"}
//                   </p>

//                 </div>

//                 <div>

//                   <p className="text-xs text-slate-500">
//                     Assigned Agent
//                   </p>

//                   <p className="mt-1 text-sm font-medium">
//                     {assignedAgentName || "Not assigned"}
//                   </p>

//                 </div>

//                 <div>

//                   <p className="text-xs text-slate-500">
//                     Created
//                   </p>

//                   <p className="mt-1 text-sm font-medium">
//                     {createdAt
//                       ? new Date(
//                           createdAt
//                         ).toLocaleString()
//                       : "N/A"}
//                   </p>

//                 </div>

//                 {updatedAt && (
//                   <div>

//                     <p className="text-xs text-slate-500">
//                       Last Updated
//                     </p>

//                     <p className="mt-1 text-sm font-medium">
//                       {new Date(
//                         updatedAt
//                       ).toLocaleString()}
//                     </p>

//                   </div>
//                 )}

//               </div>

//             </div>

//           </div>

//         </div>

//       </main>
//     </div>
//   );
// }

// export default ComplaintDetails;



















// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../services/api";

// function ComplaintDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [complaint, setComplaint] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     loadComplaint();
//   }, [id]);

//   const loadComplaint = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await api.get(`/Complaint/${id}`);

//       setComplaint(response.data);
//     } catch (err) {
//       console.error("Complaint details error:", err);

//       if (err.response?.status === 401) {
//         setError("Your session has expired. Please login again.");
//       } else if (err.response?.status === 403) {
//         setError(
//           "You do not have permission to view this complaint."
//         );
//       } else if (err.response?.status === 404) {
//         setError("Complaint not found.");
//       } else {
//         setError(
//           err.response?.data?.message ||
//             "Unable to load complaint details."
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBack = () => {
//     navigate("/dashboard");
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
//         <div className="text-center">
//           <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400"></div>

//           <p className="text-slate-400">
//             Loading complaint...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
//         <div className="mx-auto max-w-3xl">
//           <button
//             onClick={handleBack}
//             className="mb-6 text-sm text-cyan-400 hover:text-cyan-300"
//           >
//             ← Back to Dashboard
//           </button>

//           <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
//             <h2 className="text-lg font-semibold text-red-400">
//               Error
//             </h2>

//             <p className="mt-2 text-sm text-red-300">
//               {error}
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!complaint) {
//     return null;
//   }

//   const status =
//     complaint.status ?? complaint.Status;

//   const priority =
//     complaint.priority ?? complaint.Priority;

//   const title =
//     complaint.title ?? complaint.Title;

//   const description =
//     complaint.description ?? complaint.Description;

//   const sentiment =
//     complaint.sentiment ?? complaint.Sentiment;

//   const aiCategory =
//   complaint.ai_Category ??
//   complaint.aI_Category ??
//   complaint.AI_Category ??
//   complaint.aiCategory;

// const aiSummary =
//   complaint.ai_Summary ??
//   complaint.aI_Summary ??
//   complaint.AI_Summary ??
//   complaint.aiSummary;

// const aiSuggestedResponse =
//   complaint.ai_SuggestedResponse ??
//   complaint.aI_SuggestedResponse ??
//   complaint.AI_SuggestedResponse ??
//   complaint.aiSuggestedResponse;
  
  
//     // const aiCategory =
//   //   complaint.ai_Category ??
//   //   complaint.AI_Category;

//   // const aiSummary =
//   //   complaint.ai_Summary ??
//   //   complaint.AI_Summary;

//   // const aiSuggestedResponse =
//   //   complaint.ai_SuggestedResponse ??
//   //   complaint.AI_SuggestedResponse;

//   const categoryName =
//     complaint.categoryName ??
//     complaint.CategoryName;

//   const assignedAgentName =
//     complaint.assignedAgentName ??
//     complaint.AssignedAgentName;

//   const createdAt =
//     complaint.createdAt ??
//     complaint.CreatedAt;

//   const updatedAt =
//     complaint.updatedAt ??
//     complaint.UpdatedAt;

//   const getStatusClass = () => {
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

//   const getPriorityClass = () => {
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

//   return (
//     <div className="min-h-screen bg-slate-950 text-white">

//       {/* NAVBAR */}
//       <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
//         <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

//           <div>
//             <h1 className="text-xl font-bold">
//               SmartSupport
//             </h1>

//             <p className="text-xs text-slate-400">
//               Complaint Details
//             </p>
//           </div>

//           <button
//             onClick={handleBack}
//             className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
//           >
//             ← Dashboard
//           </button>

//         </div>
//       </nav>

//       {/* MAIN */}
//       <main className="mx-auto max-w-6xl px-6 py-8">

//         {/* HEADER */}
//         <div className="mb-6">

//           <p className="mb-2 text-sm text-cyan-400">
//             Complaint #{complaint.id ?? complaint.Id}
//           </p>

//           <h2 className="text-3xl font-bold">
//             {title}
//           </h2>

//           <div className="mt-4 flex flex-wrap items-center gap-3">

//             <span
//               className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass()}`}
//             >
//               {status}
//             </span>

//             <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
//               Priority:{" "}
//               <span className={getPriorityClass()}>
//                 {priority}
//               </span>
//             </span>

//             {categoryName && (
//               <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
//                 {categoryName}
//               </span>
//             )}

//           </div>

//         </div>

//         {/* GRID */}
//         <div className="grid gap-6 lg:grid-cols-3">

//           {/* LEFT - COMPLAINT */}
//           <div className="lg:col-span-2">

//             <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

//               <h3 className="text-lg font-semibold">
//                 Complaint Description
//               </h3>

//               <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-5">

//                 <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
//                   {description}
//                 </p>

//               </div>

//             </div>

//             {/* AI ANALYSIS */}
//             <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">

//               <div className="flex items-center gap-3">

//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
//                   🤖
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-semibold">
//                     Gemini AI Analysis
//                   </h3>

//                   <p className="text-xs text-slate-400">
//                     AI-powered complaint analysis
//                   </p>
//                 </div>

//               </div>

//               {/* AI CARDS */}
//               <div className="mt-6 grid gap-4 sm:grid-cols-3">

//                 <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

//                   <p className="text-xs text-slate-500">
//                     AI Category
//                   </p>

//                   <p className="mt-2 font-semibold text-cyan-400">
//                     {aiCategory || "Not available"}
//                   </p>

//                 </div>

//                 <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

//                   <p className="text-xs text-slate-500">
//                     Sentiment
//                   </p>

//                   <p className="mt-2 font-semibold text-purple-400">
//                     {sentiment || "Not available"}
//                   </p>

//                 </div>

//                 <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

//                   <p className="text-xs text-slate-500">
//                     Priority
//                   </p>

//                   <p className={`mt-2 font-semibold ${getPriorityClass()}`}>
//                     {priority}
//                   </p>

//                 </div>

//               </div>

//               {/* SUMMARY */}
//               <div className="mt-5">

//                 <p className="mb-2 text-sm font-semibold text-slate-300">
//                   AI Summary
//                 </p>

//                 <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

//                   <p className="text-sm leading-7 text-slate-300">
//                     {aiSummary || "AI summary not available."}
//                   </p>

//                 </div>

//               </div>

//               {/* SUGGESTED RESPONSE */}
//               <div className="mt-5">

//                 <p className="mb-2 text-sm font-semibold text-slate-300">
//                   AI Suggested Response
//                 </p>

//                 <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-5">

//                   <p className="text-sm leading-7 text-slate-300">
//                     {aiSuggestedResponse ||
//                       "AI suggested response not available."}
//                   </p>

//                 </div>

//               </div>

//             </div>

//           </div>

//           {/* RIGHT - DETAILS */}
//           <div>

//             <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

//               <h3 className="text-lg font-semibold">
//                 Complaint Information
//               </h3>

//               <div className="mt-5 space-y-5">

//                 <div>
//                   <p className="text-xs text-slate-500">
//                     Complaint ID
//                   </p>

//                   <p className="mt-1 text-sm font-medium">
//                     #{complaint.id ?? complaint.Id}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-slate-500">
//                     Status
//                   </p>

//                   <p className="mt-1 text-sm font-medium">
//                     {status}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-slate-500">
//                     Priority
//                   </p>

//                   <p className={`mt-1 text-sm font-medium ${getPriorityClass()}`}>
//                     {priority}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-slate-500">
//                     Category
//                   </p>

//                   <p className="mt-1 text-sm font-medium">
//                     {categoryName || "Not assigned"}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-slate-500">
//                     Assigned Agent
//                   </p>

//                   <p className="mt-1 text-sm font-medium">
//                     {assignedAgentName || "Not assigned"}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-slate-500">
//                     Created
//                   </p>

//                   <p className="mt-1 text-sm font-medium">
//                     {createdAt
//                       ? new Date(createdAt).toLocaleString()
//                       : "N/A"}
//                   </p>
//                 </div>

//                 {updatedAt && (
//                   <div>
//                     <p className="text-xs text-slate-500">
//                       Last Updated
//                     </p>

//                     <p className="mt-1 text-sm font-medium">
//                       {new Date(updatedAt).toLocaleString()}
//                     </p>
//                   </div>
//                 )}

//               </div>

//             </div>

//           </div>

//         </div>

//       </main>
//     </div>
//   );
// }

// export default ComplaintDetails;