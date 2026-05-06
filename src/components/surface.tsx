import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "positive" | "warning" | "danger" | "accent";
};

type BadgeTone = "default" | "positive" | "warning" | "danger" | "accent" | "muted";

export function PageHeader({ eyebrow, title, description, actions, className = "" }: PageHeaderProps) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </header>
  );
}

export function SectionCard({ title, description, actions, children, className = "" }: SectionCardProps) {
  return (
    <section className={`surface-card ${className}`.trim()}>
      <div className="surface-card__header">
        <div>
          <h2 className="surface-card__title">{title}</h2>
          {description ? <p className="surface-card__description">{description}</p> : null}
        </div>
        {actions ? <div className="surface-card__actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, tone = "default" }: StatCardProps) {
  return (
    <article className={`stat-card stat-card--${tone}`.trim()}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {hint ? <span className="stat-card__hint">{hint}</span> : null}
    </article>
  );
}

export function Badge({ tone = "default", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge-pill badge-pill--${tone}`.trim()}>{children}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone = priority === "HIGH" ? "danger" : priority === "MEDIUM" ? "warning" : "muted";

  return <Badge tone={tone}>{priority.toLowerCase()}</Badge>;
}

export function TaskStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const tone = normalized === "DONE" ? "positive" : normalized === "IN_PROGRESS" ? "accent" : "muted";

  return <Badge tone={tone}>{normalized.replaceAll("_", " ").toLowerCase()}</Badge>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {description ? <p className="empty-state__description">{description}</p> : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
