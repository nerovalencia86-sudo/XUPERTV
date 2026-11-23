import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { useClock } from '../hooks/useClock';
import { PageHeader } from '../components/PageHeader';
import { FilterChips } from '../components/FilterChips';
import { ChannelCard } from '../components/Cards';
import { EmptyState } from '../components/EmptyState';

export function LivePage() {
  const catalog = useStore((state) => state.catalog);
  const [category, setCategory] = useState('Todas');
  useClock(30000);

  const channels = catalog?.channels ?? [];
  const categories = useMemo(() => ['Todas', ...Array.from(new Set(channels.map((channel) => channel.category)))], [channels]);
  const visible = category === 'Todas' ? channels : channels.filter((channel) => channel.category === category);

  if (channels.length === 0) {
    return (
      <EmptyState
        title="Sin canales en vivo"
        message="La fuente actual no incluye canales. Añade una lista M3U o una cuenta Xtream Codes en ajustes."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Televisión en directo"
        title="En vivo"
        description="La parrilla completa de XUPERTV, actualizada en tiempo real. Elige un canal y pulsa Enter."
        right={
          <span className="count-pill">
            <span className="live-dot" /> {visible.length} canales
          </span>
        }
      />
      <FilterChips options={categories} value={category} onChange={setCategory} />
      <div className="channel-grid">
        {visible.map((channel, index) => (
          <ChannelCard key={channel.id} channel={channel} autoFocus={index === 0} />
        ))}
      </div>
    </>
  );
}
