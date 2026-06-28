import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui/Button'
import {
  ShieldCheckIcon, StarIcon, ClockIcon, BoltIcon,
  ArrowRightIcon, CheckCircleIcon
} from '@heroicons/react/24/outline'

const FEATURES = [
  {
    icon: ShieldCheckIcon,
    title: 'Proveedores verificados',
    desc: 'Todos los profesionales pasan por un proceso de verificación riguroso.'
  },
  {
    icon: StarIcon,
    title: 'Calificaciones reales',
    desc: 'Reseñas honestas de clientes que contrataron el servicio.'
  },
  {
    icon: ClockIcon,
    title: 'Respuesta rápida',
    desc: 'Recibe propuestas y confirma tu servicio en menos de 24 horas.'
  },
  {
    icon: BoltIcon,
    title: 'Gestión simple',
    desc: 'Solicita, sigue el estado y coordina todo desde un solo lugar.'
  },
]

const CATEGORIES = [
  { name: 'Diseño', emoji: '🎨', count: 120 },
  { name: 'Tecnología', emoji: '💻', count: 245 },
  { name: 'Marketing', emoji: '📣', count: 89 },
  { name: 'Educación', emoji: '📚', count: 67 },
  { name: 'Salud', emoji: '🏥', count: 44 },
  { name: 'Construcción', emoji: '🏗️', count: 133 },
  { name: 'Hogar', emoji: '🏠', count: 98 },
  { name: 'Legal', emoji: '⚖️', count: 31 },
]

export const HomePage = () => (
  <div>
    {/* Hero */}
    <section
      className="relative overflow-hidden"
      style={{ background: 'var(--navy)', paddingTop: '5rem', paddingBottom: '5rem' }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'var(--orange)' }}
      />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: 'rgba(244,101,10,0.2)', color: 'var(--orange-light)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft" />
          Más de 2,500 profesionales disponibles
        </div>

        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Encuentra el servicio
          <span style={{ color: 'var(--orange)' }}> perfecto</span>
          <br />para tu proyecto
        </h1>

        <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-10">
          Conectamos clientes con los mejores profesionales. Solicita, compara y contrata con total confianza.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/services">
            <button
              className="px-8 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: 'var(--orange)', fontFamily: 'var(--font-display)' }}
            >
              Explorar servicios
              <ArrowRightIcon className="w-5 h-5 inline ml-2" />
            </button>
          </Link>
          <Link to="/register">
            <button
              className="px-8 py-4 rounded-xl font-bold text-white text-base border-2 transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Publicar servicio
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
          {[
            { n: '2.5K+', label: 'Servicios' },
            { n: '98%', label: 'Satisfacción' },
            { n: '24h', label: 'Respuesta' },
          ].map(({ n, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--orange)', fontFamily: 'var(--font-display)' }}>{n}</div>
              <div className="text-xs text-blue-300 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Categories */}
    <section className="py-16 px-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
            Explora por categoría
          </h2>
          <p className="text-sm" style={{ color: 'var(--gray-3)' }}>
            Encuentra exactamente lo que buscas
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(({ name, emoji, count }) => (
            <Link
              key={name}
              to={`/services?category=${encodeURIComponent(name)}`}
              className="rounded-2xl border p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 group"
              style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <p className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>{name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--gray-3)' }}>{count} servicios</p>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-16 px-6" style={{ background: 'var(--bg-white)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
            ¿Por qué elegir GestionServicios?
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border p-5 transition-all hover:shadow-md" style={{ borderColor: 'var(--gray-5)' }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(15,45,84,0.06)' }}
              >
                <Icon className="w-5 h-5" style={{ color: 'var(--navy)' }} />
              </div>
              <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--navy)' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--gray-3)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 px-6" style={{ background: 'var(--navy)' }}>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          ¿Listo para empezar?
        </h2>
        <p className="text-blue-200 text-sm mb-8">
          Regístrate gratis y encuentra el servicio que necesitas hoy mismo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <button className="px-8 py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ background: 'var(--orange)' }}>
              Crear cuenta gratis
            </button>
          </Link>
          <Link to="/services">
            <button className="px-8 py-3.5 rounded-xl font-bold text-white border-2 transition-all hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
              Ver servicios
            </button>
          </Link>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 px-6 border-t" style={{ background: 'var(--bg-white)', borderColor: 'var(--gray-5)' }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ background: 'var(--navy)' }}>GS</div>
          <span className="font-bold text-sm" style={{ color: 'var(--navy)' }}>GestionServicios</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--gray-3)' }}>© 2025 GestionServicios. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
)
