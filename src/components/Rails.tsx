import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface RailProps {
  title: string;
  moreTo?: string;
  children: ReactNode;
}

export function Rail({ title, moreTo, children }: RailProps) {
  return (
    <section className="rail">
      <header className="rail-head">
        <h2>{title}</h2>
        {moreTo ? (
          <Link to={moreTo} className="rail-more" data-focusable>
            Ver todo <ChevronRight size={15} />
          </Link>
        ) : null}
      </header>
      <div className="rail-track">{children}</div>
    </section>
  );
}
