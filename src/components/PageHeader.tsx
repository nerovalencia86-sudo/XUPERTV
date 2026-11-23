import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  right?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, right }: PageHeaderProps) {
  return (
    <header className="page-head">
      <div className="page-head-text">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {right ? <div className="page-head-right">{right}</div> : null}
    </header>
  );
}
