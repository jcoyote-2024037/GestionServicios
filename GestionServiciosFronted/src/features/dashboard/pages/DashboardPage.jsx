import Background from '../../../shared/components/ui/Background'

export const DashboardPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F7F8FA',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'white',
          borderBottom: '1px solid #E2E8F0',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #F4650A, #D4520A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            GS
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0F2D54' }}>
            GestionServicios
          </span>
        </div>
      </header>

      {/* Island decorative background */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '400px' }}>
        <Background />
      </div>

      {/* Content */}
      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '40px 32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#0F2D54',
            marginBottom: 8,
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: '#718096', marginBottom: 32 }}>
          Bienvenido al panel de administración
        </p>

        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {[
            { label: 'Servicios activos', value: '128', color: '#F4650A' },
            { label: 'Solicitudes pendientes', value: '14', color: '#F59E0B' },
            { label: 'Usuarios registrados', value: '342', color: '#10B981' },
            { label: 'Ingresos del mes', value: '$4,280', color: '#3B82F6' },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                border: '1px solid #E2E8F0',
              }}
            >
              <p style={{ fontSize: 13, color: '#A0AEC0', marginBottom: 8, fontWeight: 500 }}>
                {card.label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
