import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import api from "../services/api";

function CreateComplaint() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get("/Category");

      setCategories(response.data);
    } catch (error) {
      console.error("Category error:", error);

      // Category optional hai, isliye form ko block nahi karenge.
      setCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Please enter a complaint title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please describe your complaint.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId
          ? Number(formData.categoryId)
          : null,
      };

      const response = await api.post(
        "/Complaint",
        payload
      );

      console.log("Complaint created:", response.data);

      setSuccess(
        `Complaint #${response.data.complaintId} created successfully.`
      );

      setFormData({
        title: "",
        description: "",
        categoryId: "",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      console.error("Create complaint error:", error);

      if (error.response) {
        setError(
          error.response.data?.message ||
            `Request failed with status ${error.response.status}.`
        );
      } else if (error.request) {
        setError(
          "Unable to connect to the backend."
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

      {/* Header */}

      <header className="border-b border-slate-800 bg-slate-900">

        <div className="mx-auto flex max-w-5xl items-center px-6 py-4">

          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="font-bold">
              Create Complaint
            </h1>

            <p className="text-xs text-slate-500">
              Submit a new support request
            </p>
          </div>

        </div>

      </header>

      {/* Main */}

      <main className="mx-auto max-w-5xl px-6 py-10">

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Information */}

          <div className="lg:col-span-1">

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Sparkles size={24} />
              </div>

              <h2 className="mt-5 text-xl font-bold">
                AI-Powered Support
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Our AI will automatically analyze your
                complaint and identify its category,
                priority, sentiment and summary.
              </p>

              <div className="mt-6 space-y-4">

                <Feature
                  title="AI Category"
                  text="Automatically identify the complaint type."
                />

                <Feature
                  title="Priority Detection"
                  text="Determine how urgent the complaint is."
                />

                <Feature
                  title="Sentiment Analysis"
                  text="Understand the customer's sentiment."
                />

                <Feature
                  title="AI Response"
                  text="Generate a helpful suggested response."
                />

              </div>

            </div>

          </div>

          {/* Form */}

          <div className="lg:col-span-2">

            <div className="rounded-2xl border border-slate-800 bg-slate-900">

              <div className="border-b border-slate-800 px-6 py-5">

                <h2 className="text-xl font-semibold">
                  Complaint Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Provide as much detail as possible.
                </p>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 p-6"
              >

                {/* Error */}

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">

                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>

                  </div>
                )}

                {/* Success */}

                {success && (
                  <div className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">

                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{success}</span>

                  </div>
                )}

                {/* Title */}

                <div>

                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-medium"
                  >
                    Complaint Title
                  </label>

                  <div className="relative">

                    <FileText
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Example: Internet connection is very slow"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />

                  </div>

                </div>

                {/* Category */}

                <div>

                  <label
                    htmlFor="categoryId"
                    className="mb-2 block text-sm font-medium"
                  >
                    Category
                    <span className="ml-2 text-xs text-slate-500">
                      Optional
                    </span>
                  </label>

                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    disabled={categoryLoading}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >

                    <option value="">
                      {categoryLoading
                        ? "Loading categories..."
                        : "Select a category"}
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}

                  </select>

                </div>

                {/* Description */}

                <div>

                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium"
                  >
                    Describe Your Complaint
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={7}
                    placeholder="Describe what happened, when it happened, and how it is affecting you..."
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <p className="mt-2 text-xs text-slate-600">
                    {formData.description.length} characters
                  </p>

                </div>

                {/* Submit */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/dashboard")
                    }
                    className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {loading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send size={18} />

                        Submit Complaint
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="flex gap-3">

      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />

      <div>
        <p className="text-sm font-medium text-slate-200">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {text}
        </p>
      </div>

    </div>
  );
}

export default CreateComplaint;