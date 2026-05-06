"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";

import { EmptyState, PageHeader, PriorityBadge, SectionCard, TaskStatusBadge } from "@/components/surface";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string;
  assignedToId: string | null;
  assignedTo: {
    name: string;
    email: string;
  } | null;
  project: {
    name: string;
  };
}

interface ProjectInfo {
  id: string;
  name: string;
  description: string;
}

export default function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  const fetchProjectAndTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/tasks?projectId=${projectId}`),
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
    } catch {
      setError("Failed to load project tasks");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // Initial client-side bootstrap for the project task board.
    (async () => {
      await fetchProjectAndTasks();
    })();
  }, [fetchProjectAndTasks]);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          projectId,
          dueDate: newTask.dueDate || null,
        }),
      });

      if (res.ok) {
        setNewTask({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
        setShowNewTaskForm(false);
        setError("");
        await fetchProjectAndTasks();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create task");
      }
    } catch {
      setError("Failed to create task");
    }
  }

  async function handleUpdateTaskStatus(taskId: string, newStatus: string) {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (res.ok) {
        await fetchProjectAndTasks();
      }
    } catch {
      setError("Failed to update task");
    }
  }

  if (loading) return <div className="surface-card" style={{ textAlign: "center" }}>Loading project tasks...</div>;
  if (error) return <div className="surface-card" style={{ textAlign: "center", color: "var(--error)" }}>{error}</div>;
  if (!project) return <div className="surface-card" style={{ textAlign: "center", color: "var(--error)" }}>Project not found</div>;

  const completedCount = tasks.filter((task) => task.status === "DONE").length;

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Project task board"
        title={`${project?.name} tasks`}
        description="Create, prioritize, and update the work in this project without leaving the board."
        actions={
          <>
            <Link href={`/projects/${projectId}`} className="button button-secondary">
              Back to project
            </Link>
            <button onClick={() => setShowNewTaskForm(!showNewTaskForm)} className="button button-primary">
              {showNewTaskForm ? "Close form" : "+ New task"}
            </button>
          </>
        }
      />

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Tasks</span>
          <span className="stat-card__value">{tasks.length}</span>
          <span className="stat-card__hint">All tasks in this project</span>
        </div>
        <div className="stat-card stat-card--accent">
          <span className="stat-card__label">Completed</span>
          <span className="stat-card__value">{completedCount}</span>
          <span className="stat-card__hint">Tasks delivered</span>
        </div>
        <div className="stat-card stat-card--warning">
          <span className="stat-card__label">Open</span>
          <span className="stat-card__value">{tasks.length - completedCount}</span>
          <span className="stat-card__hint">Still moving</span>
        </div>
        <div className="stat-card stat-card--positive">
          <span className="stat-card__label">Project</span>
          <span className="stat-card__value">{project?.name ? "Live" : "Draft"}</span>
          <span className="stat-card__hint">Current workspace state</span>
        </div>
      </div>

      {error ? <div className="surface-card" style={{ borderColor: "rgba(194, 65, 12, 0.2)", color: "var(--error)" }}>{error}</div> : null}

      {showNewTaskForm ? (
        <SectionCard title="Create task" description="Add a new task to this project and set its first signal.">
          <form onSubmit={handleCreateTask} className="form-grid">
            <div className="field">
              <label className="field-label" htmlFor="task-title">Task title</label>
              <input
                id="task-title"
                type="text"
                className="input"
                placeholder="e.g., Design login page"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                className="textarea"
                placeholder="Optional task description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <div className="field">
                <label className="field-label" htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="select"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="task-due-date">Due date</label>
                <input
                  id="task-due-date"
                  type="date"
                  className="input"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="button button-primary">
              Create task
            </button>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard title="Task ledger" description="Update statuses and scan who owns what at a glance.">
        {tasks.length === 0 ? (
          <EmptyState title="No tasks yet" description="Open the create form to add the first task to this project." />
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned to</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="table-title">{task.title}</div>
                      {task.description ? <p className="table-copy">{task.description}</p> : null}
                    </td>
                    <td>
                      {task.assignedTo ? (
                        <div>
                          <div className="table-title">{task.assignedTo.name}</div>
                          <p className="table-copy">{task.assignedTo.email}</p>
                        </div>
                      ) : (
                        <span className="table-copy">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                        className="select status-select"
                      >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    <td>
                      <TaskStatusBadge status={task.status} />
                      <p className="table-copy" style={{ marginTop: "0.4rem" }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
