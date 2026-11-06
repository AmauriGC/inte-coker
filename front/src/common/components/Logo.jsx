/** Cubo de GC-Confort. Con "animado" dibuja el trazo (como en el splash). */
export default function Logo({ className = 'size-6', animado = false, grosor = 1.7 }) {
  const trazo = animado ? 'animate-trazo [stroke-dasharray:90]' : '';
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path className={trazo} d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path className={trazo} style={animado ? { animationDelay: '0.25s' } : undefined} d="m3.3 7 8.7 5 8.7-5" />
      <path className={trazo} style={animado ? { animationDelay: '0.4s' } : undefined} d="M12 22V12" />
    </svg>
  );
}
