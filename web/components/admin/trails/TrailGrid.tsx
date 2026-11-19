"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Mountain,
  X,
  ImagePlus,
} from "lucide-react";

import { useDashboard } from "@/components/admin/DashboardClient";
import TrailCard, { Trail } from "./TrailCard";

type ApiResponse = {
  trails?: Trail[];
  trail?: Trail;
  message?: string;
  errors?: Record<string, string[]>;
};

type TrailForm = {
  name: string;
  description: string;
  difficulty: string;
  max_capacity: string;
  image: File | null;
  remove_image: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

const EMPTY_FORM: TrailForm = {
  name: "",
  description: "",
  difficulty: "MODERATE",
  max_capacity: "500",
  image: null,
  remove_image: false,
};

function isActive(value: Trail["is_active"]) {
  return value === true || value === 1 || value === "1";
}

export default function TrailGrid() {
  const { accessToken } = useDashboard();

  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrail, setEditingTrail] = useState<Trail | null>(null);
  const [form, setForm] = useState<TrailForm>(EMPTY_FORM);

  const fetchTrails = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken) {
        setTrails([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/admin/trails`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          signal,
        });

        const result: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load trail records.");
        }

        if (!signal?.aborted) {
          setTrails(Array.isArray(result.trails) ? result.trails : []);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error ? err.message : "Unable to load trail records."
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchTrails(controller.signal);
    return () => controller.abort();
  }, [fetchTrails]);

  const filteredTrails = useMemo(() => {
    const term = search.trim().toLowerCase();

    return trails.filter((trail) => {
      const matchesSearch =
        !term ||
        [trail.name, trail.description, trail.difficulty].some((value) =>
          String(value ?? "").toLowerCase().includes(term)
        );

      const active = isActive(trail.is_active);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      const matchesDifficulty =
        difficultyFilter === "ALL" ||
        trail.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesDifficulty;
    });
  }, [trails, search, statusFilter, difficultyFilter]);

  const difficulties = useMemo(
    () =>
      Array.from(
        new Set(trails.map((trail) => trail.difficulty).filter(Boolean))
      ),
    [trails]
  );

  function openCreateModal() {
    setEditingTrail(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(trail: Trail) {
    setEditingTrail(trail);
    setForm({
      name: trail.name,
      description: trail.description || "",
      difficulty: trail.difficulty || "MODERATE",
      max_capacity: String(trail.max_capacity ?? 500),
      image: null,
      remove_image: false,
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingTrail(null);
    setForm(EMPTY_FORM);
  }

  async function submitTrail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const body = new FormData();
      body.append("name", form.name.trim());
      body.append("description", form.description.trim());
      body.append("difficulty", form.difficulty);
      body.append("max_capacity", form.max_capacity);

      if (form.image) {
        body.append("image", form.image);
      }

      if (editingTrail && form.remove_image) {
        body.append("remove_image", "1");
      }

      const url = editingTrail
        ? `${API_URL}/api/admin/trails/${editingTrail.id}`
        : `${API_URL}/api/admin/trails`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        const validationMessage = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";

        throw new Error(
          validationMessage || result.message || "Unable to save trail."
        );
      }

      setSuccess(result.message || "Trail saved successfully.");
      setModalOpen(false);
      setEditingTrail(null);
      setForm(EMPTY_FORM);
      await fetchTrails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save trail.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(trail: Trail) {
    if (!accessToken) return;

    const nextStatus = !isActive(trail.is_active);
    const action = nextStatus ? "activate" : "deactivate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} "${trail.name}"?`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/trails/${trail.id}/status`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ is_active: nextStatus }),
        }
      );

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Unable to ${action} trail.`);
      }

      setSuccess(result.message || "Trail status updated.");
      await fetchTrails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status.");
    }
  }

  async function deleteTrail(trail: Trail) {
    if (!accessToken) return;

    if (
      !window.confirm(
        `Delete "${trail.name}" permanently?\n\nTrails with booking records cannot be deleted.`
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/admin/trails/${trail.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete trail.");
      }

      setSuccess(result.message || "Trail deleted successfully.");
      await fetchTrails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete trail.");
    }
  }

  const activeCount = trails.filter((trail) =>
    isActive(trail.is_active)
  ).length;

  const inactiveCount = trails.length - activeCount;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Trail Management
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create, update, and manage Mount Pulag trails.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void fetchTrails()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Plus size={17} />
            Add Trail
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Trails</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {trails.length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Trails</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Inactive Trails</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {inactiveCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search trails..."
          aria-label="Search trails"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by trail status"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
        >
          <option value="ALL">All Trail Statuses</option>
          <option value="ACTIVE">Active Trails</option>
          <option value="INACTIVE">Inactive Trails</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(event) => setDifficultyFilter(event.target.value)}
          aria-label="Filter by trail difficulty"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
        >
          <option value="ALL">All Difficulty Levels</option>
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <RefreshCw size={18} className="animate-spin" />
            Loading trails...
          </div>
        </div>
      ) : filteredTrails.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <Mountain size={32} className="text-zinc-400" />
          <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
            No trails found
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Add a trail or change your search and filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrails.map((trail) => (
              <TrailCard
                key={trail.id}
                trail={trail}
                onEdit={openEditModal}
                onToggleStatus={toggleStatus}
                onDelete={deleteTrail}
              />
            ))}
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing {filteredTrails.length} of {trails.length} trail records.
          </p>
        </>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="trail-form-title"
            className="my-6 w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div>
                <h2
                  id="trail-form-title"
                  className="text-xl font-bold text-zinc-900 dark:text-white"
                >
                  {editingTrail ? "Edit Trail" : "Add New Trail"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Enter the trail information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitTrail} className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Trail Name
                </label>
                <input
                  required
                  maxLength={255}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter trail name"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe the trail..."
                  className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    Difficulty
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(event) =>
                      setForm({ ...form, difficulty: event.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    Maximum Capacity
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="500"
                    value={form.max_capacity}
                    onChange={(event) =>
                      setForm({ ...form, max_capacity: event.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Maximum allowed value: 500.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Trail Image
                </label>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-5 text-sm text-zinc-600 transition hover:border-emerald-500 dark:border-zinc-700 dark:text-zinc-300">
                  <ImagePlus size={19} />
                  {form.image ? form.image.name : "Choose an image (max 5 MB)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        image: event.target.files?.[0] ?? null,
                        remove_image: false,
                      })
                    }
                  />
                </label>

                {editingTrail?.image && (
                  <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.remove_image}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          remove_image: event.target.checked,
                          image: event.target.checked ? null : form.image,
                        })
                      }
                    />
                    Remove current image
                  </label>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 pt-5 dark:border-zinc-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingTrail
                      ? "Save Changes"
                      : "Create Trail"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
