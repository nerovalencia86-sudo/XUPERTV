import type { Catalog, Channel, Episode, Movie, Series } from '../types';
import { realChannels } from './realChannels';
import { realMovies } from './realMovies';
import { realSeries } from './realSeries';

export const COLOR_PAIRS: [string, string][] = [
  ['#7CFC8A', '#0E7A5F'],
  ['#FFB86B', '#B3352C'],
  ['#7DD3FC', '#1E3A8A'],
  ['#F472B6', '#7E22CE'],
  ['#FDE68A', '#B45309'],
  ['#A7F3D0', '#065F46'],
  ['#C4B5FD', '#4C1D95'],
  ['#FCA5A5', '#991B1B'],
  ['#93C5FD', '#1D4ED8'],
  ['#FCD34D', '#78350F'],
  ['#5EEAD4', '#115E59'],
  ['#FDA4AF', '#881337'],
];

const HLS_STREAMS = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://test-streams.mux.dev/pts_shift/master.m3u8',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  'https://test-streams.mux.dev/tos_ismc/main.m3u8',
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  'https://test-streams.mux.dev/test_001/stream.m3u8',
];

const MP4_STREAMS = [
  '/media/bunny.mp4',
  '/media/sintel.mp4',
  '/media/jellyfish.mp4',
  '/media/flower.mp4',
];

export const PROGRAM_POOL: Record<string, string[]> = {
  Deportes: ['Fútbol Total: Liga Xuper', 'Motor GP: Retroceso', 'Baloncesto en Vivo', 'Mesa de Análisis', 'Tenis Abierto'],
  Noticias: ['Primera Hora', 'Noticias 24', 'La Entrevista', 'Mundo Hoy', 'Radar Económico'],
  Cine: ['Sesión de Medianoche', 'Clásicos Restaurados', 'Estreno del Mes', 'Cine de Autor'],
  Series: ['Maratón de Medianoche', 'Episodio Estreno', 'Grandes Finales', 'Serie de la Semana'],
  Música: ['Top 40 Xuper', 'Videos Clásicos', 'Sesión Acústica', 'After Hours'],
  Infantil: ['Aventuras Animadas', 'Hora del Cuento', 'Club de Dibujos', 'Pequeños Genios'],
  Documentales: ['Planeta Azul', 'Ingeniería Extrema', 'Historia Oculta', 'Vida Salvaje'],
  Entretenimiento: ['Reality Xuper', 'Humor Sin Filtro', 'Retos Extremos', 'Talk Show'],
};

const channelSeed: [string, string, string][] = [
  ['XUPER Sports', 'Deportes', 'XS'],
  ['La Cancha 24/7', 'Deportes', 'LC'],
  ['Mundo Noticias', 'Noticias', 'MN'],
  ['Radar 24', 'Noticias', 'R24'],
  ['XUPER Cine', 'Cine', 'XC'],
  ['Órbita Cinema', 'Cine', 'OC'],
  ['Serie Manía', 'Series', 'SM'],
  ['Ritmo TV', 'Música', 'RT'],
  ['Pequeños Genios', 'Infantil', 'PG'],
  ['Planeta Salvaje', 'Documentales', 'PS'],
  ['Historia Viva', 'Documentales', 'HV'],
  ['Risas 24', 'Entretenimiento', 'R24'],
];

export const demoChannels: Channel[] = channelSeed.map(([name, category, logo], index) => ({
  id: `ch-${index + 1}`,
  name,
  category,
  streamUrl: HLS_STREAMS[index % HLS_STREAMS.length],
  colors: COLOR_PAIRS[index % COLOR_PAIRS.length],
}));

const movieSeeds: Array<[string, number, number, string[], number, string]> = [
  ['Neón Salvaje', 2024, 8.1, ['Acción', 'Ciencia ficción'], 118, 'En una metrópolis que nunca duerme, una mensajera clandestina descubre que el último paquete de su carrera puede cambiar el equilibrio de poder de toda la ciudad.'],
  ['El Último Faro', 2023, 7.6, ['Drama'], 104, 'Un farero solitario y una bióloga marina comparten un verano de tormentas, secretos y una amistad que ninguno de los dos esperaba.'],
  ['Órbita 9', 2025, 8.4, ['Ciencia ficción', 'Aventura'], 126, 'La tripulación de una estación orbital recibe una señal imposible: proviene de una nave que se perdió hace cuarenta años con sus propios padres a bordo.'],
  ['Callejón Sin Salida', 2022, 7.2, ['Thriller', 'Crimen'], 98, 'Un detective retirado tiene una noche para demostrar la inocencia de su hija, atrapado entre un cartel y una ciudad que prefiere olvidar.'],
  ['Ritmo de Medianoche', 2024, 7.9, ['Música', 'Drama'], 112, 'Una productora emergente y un cantante en decadencia se encuentran en un estudio abandonado y graban el álbum que podría salvar sus carreras.'],
  ['La Ciudad Dormida', 2023, 7.4, ['Misterio'], 109, 'Cada noche, a las 3:17, un barrio entero se queda sin memoria. Una periodista decide quedarse despierta para descubrir qué ocurre en esas horas perdidas.'],
  ['Horizonte Rojo', 2025, 8.0, ['Aventura', 'Acción'], 121, 'Un equipo de rescate cruza un desierto de ceniza para llegar al último refugio habitado, perseguido por una tormenta que avanza más rápido que ellos.'],
  ['Pequeño Gigante', 2021, 7.8, ['Familiar', 'Animación'], 95, 'Un ratón de biblioteca sueña con ser explorador y termina liderando a un grupo de animales diminutos en la aventura más grande de sus vidas.'],
  ['Sombras de Acero', 2024, 7.1, ['Acción'], 107, 'Una exsoldado regresa a la ciudad que la traicionó para desmantelar una red de vigilancia que controla cada movimiento de sus habitantes.'],
  ['Verano en Marte', 2025, 7.7, ['Ciencia ficción', 'Comedia'], 101, 'Los primeros colonos adolescentes de Marte organizan el viaje de fin de curso más caro de la historia, sin permiso de la Tierra.'],
  ['El Silencio del Bosque', 2022, 7.5, ['Suspenso'], 116, 'Una guardabosques encuentra un pueblo vacío en medio de la reserva y descubre que alguien lleva veinte años cuidando de que nadie se vaya.'],
  ['Ruta 66', 2023, 7.3, ['Drama', 'Aventura'], 99, 'Dos hermanos heredan un auto clásico y el mapa incompleto de un viaje que su padre nunca terminó.'],
];

export const demoMovies: Movie[] = movieSeeds.map(([title, year, rating, genres, duration, description], index) => ({
  id: `mv-${index + 1}`,
  title,
  year,
  rating,
  genres,
  duration,
  description,
  streamUrl: MP4_STREAMS[index % MP4_STREAMS.length],
  colors: COLOR_PAIRS[(index + 3) % COLOR_PAIRS.length],
}));

const seriesSeeds: Array<[string, number, number, string[], string]> = [
  ['Distrito X', 2024, 8.3, ['Crimen', 'Drama'], 'Una unidad especial investiga los delitos que la ciudad prefiere esconder. Cada caso deja una herida nueva en el distrito más peligroso del país.'],
  ['Señal Perdida', 2025, 8.6, ['Ciencia ficción', 'Misterio'], 'Una radioaficionada capta transmisiones de una versión de su ciudad que parece congelada en 1987. Y alguien del otro lado sabe su nombre.'],
  ['Los Herederos', 2023, 7.9, ['Drama'], 'Tres hermanos heredan un imperio familiar y la obligación de mantener un secreto que podría destruir todo lo que construyeron sus padres.'],
  ['Código Lima', 2024, 8.0, ['Thriller', 'Acción'], 'Un analista de inteligencia descubre que el mayor ataque cibernético de la historia ya comenzó, y que él es el único que puede detenerlo.'],
  ['Café Central', 2022, 7.6, ['Comedia'], 'El bar más caótico de la ciudad es el escenario donde clientes, empleados y vecinos resuelven sus vidas entre tazas de café y planes que nunca salen bien.'],
  ['Frontera Salvaje', 2025, 8.2, ['Aventura', 'Drama'], 'Dos familias enfrentadas por un río y una montaña deben unirse para sobrevivir al invierno más duro de la región.'],
];

const EPISODE_TITLES = [
  'Punto de partida', 'Grietas', 'La señal', 'Sin retorno',
  'Sombras', 'La verdad', 'Huida', 'Último acto',
  'Reencuentro', 'Sospechas', 'La prueba', 'Contra el reloj',
];

const EPISODE_PLOTS = [
  'Un descubrimiento inesperado cambia el rumbo de la investigación y obliga a todos a elegir un bando.',
  'Las viejas lealtades se ponen a prueba cuando un secreto sale a la luz en el peor momento posible.',
  'Una decisión impulsiva desata consecuencias que nadie había previsto y deja una pregunta sin respuesta.',
  'Los protagonistas se enfrentan a su pasado y descubren que la única salida está más cerca de lo que creen.',
  'Una alianza improbable les da una ventaja mínima, pero el precio puede ser demasiado alto.',
  'La temporada llega a un punto de no retorno: nadie sale ileso y todo está a punto de cambiar.',
];

function buildSeasons(seriesIndex: number): Episode[][] {
  return [1, 2].map((seasonNumber) =>
    [1, 2, 3, 4].map((episodeNumber) => {
      const offset = seriesIndex * 2 + (seasonNumber - 1) * 4 + (episodeNumber - 1);
      return {
        id: `ep-${seriesIndex + 1}-${seasonNumber}-${episodeNumber}`,
        number: episodeNumber,
        title: EPISODE_TITLES[offset % EPISODE_TITLES.length],
        description: EPISODE_PLOTS[offset % EPISODE_PLOTS.length],
        duration: 40 + ((offset * 7) % 18),
        streamUrl: MP4_STREAMS[(offset + seriesIndex) % MP4_STREAMS.length],
      };
    }),
  );
}

export const demoSeries: Series[] = seriesSeeds.map(([title, year, rating, genres, description], index) => ({
  id: `sr-${index + 1}`,
  title,
  year,
  rating,
  genres,
  description,
  colors: COLOR_PAIRS[(index + 6) % COLOR_PAIRS.length],
  seasons: buildSeasons(index).map((episodes, seasonIndex) => ({
    number: seasonIndex + 1,
    episodes,
  })),
}));

export const demoCatalog: Catalog = {
  channels: realChannels,
  movies: realMovies,
  series: realSeries,
  sourceLabel: 'Xuper TV (Oficial Live + VOD)',
};
