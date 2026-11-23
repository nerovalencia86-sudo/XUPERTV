import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon={<Compass size={34} />}
      title="Esa pantalla no existe"
      message="La dirección que buscas no está disponible en XUPERTV."
      action={
        <button type="button" className="btn btn-primary" data-focusable data-autofocus onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      }
    />
  );
}
