import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './src/fields/user/user.model.js'
import Category from './src/fields/categories/categories.model.js'
import Location from './src/fields/location/location.model.js'
import Tag from './src/fields/tag/tag.model.js'
import Badge from './src/fields/badges/badges_model.js'
import Service from './src/fields/services/services.model.js'
import Review from './src/fields/reviews/reviews.model.js'
import Favorite from './src/fields/favorites/favorites.model.js'
import Solicitud from './src/fields/solicitudes/solicitudes.model.js'
import Reporte from './src/fields/reportes/reportes.model.js'
import ActivityLog from './src/fields/logs/logs_model.js'

dotenv.config()

// ─── USUARIOS ────────────────────────────────────────────────────────────────

const USERS = [
  { name: 'Admin', surname: 'Principal', username: 'admin', email: 'admin@gestionservicios.com', password: 'Admin123!', role: 'ADMIN_ROLE', emailVerified: true, municipality: 'Guatemala', department: 'Guatemala', zona: 'Zona 10' },
  { name: 'Carlos', surname: 'Mendoza', username: 'cmendoza', email: 'carlos@email.com', password: 'Password1!', role: 'DUENO_ROLE', emailVerified: true, municipality: 'Guatemala', department: 'Guatemala', zona: 'Zona 1' },
  { name: 'María', surname: 'López', username: 'mlopez', email: 'maria@email.com', password: 'Password1!', role: 'DUENO_ROLE', emailVerified: true, municipality: 'Mixco', department: 'Guatemala', zona: 'Zona 1' },
  { name: 'Pedro', surname: 'Ramírez', username: 'pramirez', email: 'pedro@email.com', password: 'Password1!', role: 'DUENO_ROLE', emailVerified: true, municipality: 'Guatemala', department: 'Guatemala', zona: 'Zona 5' },
  { name: 'Ana', surname: 'García', username: 'agarcia', email: 'ana@email.com', password: 'Password1!', role: 'USER_ROLE', emailVerified: true, municipality: 'Guatemala', department: 'Guatemala', zona: 'Zona 4' },
  { name: 'Luis', surname: 'Torres', username: 'ltorres', email: 'luis@email.com', password: 'Password1!', role: 'USER_ROLE', emailVerified: true, municipality: 'Villa Nueva', department: 'Guatemala', zona: 'Zona 3' },
]

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { nombre: 'Limpieza', descripcion: 'Servicios de limpieza residencial, comercial y profesional' },
  { nombre: 'Jardinería', descripcion: 'Corte de césped, diseño de jardines, poda y mantenimiento verde' },
  { nombre: 'Plomería', descripcion: 'Reparación e instalación de tuberías, grifos y sistemas de agua' },
  { nombre: 'Electricidad', descripcion: 'Instalaciones eléctricas, reparaciones y cableado' },
  { nombre: 'Pintura', descripcion: 'Pintura interior y exterior de casas, oficinas y edificios' },
  { nombre: 'Carpintería', descripcion: 'Fabricación y reparación de muebles, puertas y estructuras de madera' },
  { nombre: 'Cerrajería', descripcion: 'Apertura de cerraduras, cambio de candados y sistemas de seguridad' },
  { nombre: 'Mecánica automotriz', descripcion: 'Reparación y mantenimiento de vehículos, motor y frenos' },
  { nombre: 'Lavado de autos', descripcion: 'Lavado exterior e interior de vehículos, detailing y pulido' },
  { nombre: 'Mudanzas y fletes', descripcion: 'Servicio de mudanza, carga y traslado de muebles y enseres' },
  { nombre: 'Delivery y mensajería', descripcion: 'Entrega a domicilio de paquetes, documentos y compras' },
  { nombre: 'Peluquería y barbería', descripcion: 'Corte de cabello, barba, tintes y tratamientos capilares' },
  { nombre: 'Cocina y catering', descripcion: 'Servicio de comidas para eventos, fiestas y reuniones' },
  { nombre: 'Fotografía', descripcion: 'Fotografía profesional, bodas, eventos y sesiones de retrato' },
  { nombre: 'Paseo de mascotas', descripcion: 'Paseo y cuidado de perros y mascotas a domicilio' },
  { nombre: 'Niñeras', descripcion: 'Cuidado de niños a domicilio, guardería y acompañamiento' },
  { nombre: 'Reparación de electrodomésticos', descripcion: 'Reparación de refrigeradores, lavadoras, estufas y más' },
  { nombre: 'Tecnología', descripcion: 'Soporte técnico, reparación de computadoras y dispositivos electrónicos' },
  { nombre: 'Salud y bienestar', descripcion: 'Masajes, terapias, entrenamiento personal y cuidado físico' },
  { nombre: 'Clases particulares', descripcion: 'Tutorías académicas, idiomas, música y desarrollo personal' },
]

// ─── UBICACIONES ─────────────────────────────────────────────────────────────

const LOCATIONS = [
  { name: 'Zona 1', address: 'Centro Histórico', municipality: 'Guatemala', department: 'Guatemala', zona: 'Zona 1', country: 'Guatemala', lat: 14.6413, lng: -90.5139, population: 45000 },
  { name: 'Zona 4', address: 'Zona 4', municipality: 'Guatemala', department: 'Guatemala', zona: 'Zona 4', country: 'Guatemala', lat: 14.6304, lng: -90.5069, population: 32000 },
  { name: 'Zona 5', address: 'Zona 5', municipality: 'Guatemala', department: 'Guatemala', zona: 'Zona 5', country: 'Guatemala', lat: 14.6200, lng: -90.5150, population: 28000 },
  { name: 'Zona 10', address: 'Zona 10', municipality: 'Guatemala', department: 'Guatemala', zona: 'Zona 10', country: 'Guatemala', lat: 14.5885, lng: -90.4938, population: 55000 },
  { name: 'Zona 14', address: 'Zona 14', municipality: 'Guatemala', department: 'Guatemala', zona: 'Zona 14', country: 'Guatemala', lat: 14.5740, lng: -90.4860, population: 22000 },
  { name: 'Mixco Centro', address: 'Mixco Centro', municipality: 'Mixco', department: 'Guatemala', zona: 'Zona 1', country: 'Guatemala', lat: 14.6309, lng: -90.6060, population: 48000 },
  { name: 'Villa Nueva Centro', address: 'Villa Nueva Centro', municipality: 'Villa Nueva', department: 'Guatemala', zona: 'Zona 3', country: 'Guatemala', lat: 14.5269, lng: -90.5878, population: 40000 },
  { name: 'San Cristóbal', address: 'San Cristóbal', municipality: 'Mixco', department: 'Guatemala', zona: 'Zona 8', country: 'Guatemala', lat: 14.6100, lng: -90.6300, population: 35000 },
  { name: 'Cayalá', address: 'Cayalá', municipality: 'Guatemala', department: 'Guatemala', zona: 'Zona 16', country: 'Guatemala', lat: 14.5700, lng: -90.4700, population: 18000 },
  { name: 'Antigua Guatemala', address: 'Antigua Guatemala', municipality: 'Antigua Guatemala', department: 'Sacatepéquez', zona: 'Centro', country: 'Guatemala', lat: 14.5586, lng: -90.7295, population: 46000 },
]

// ─── TAGS ────────────────────────────────────────────────────────────────────

const TAGS = [
  { name: 'Urgente', slug: 'urgente', description: 'Servicios con atención inmediata' },
  { name: 'Económico', slug: 'economico', description: 'Servicios a bajo costo' },
  { name: 'Premium', slug: 'premium', description: 'Servicios de alta gama' },
  { name: 'A domicilio', slug: 'a-domicilio', description: 'El proveedor se desplaza al cliente' },
  { name: 'Emergencia 24h', slug: 'emergencia-24h', description: 'Disponible las 24 horas' },
  { name: 'Eco-friendly', slug: 'eco-friendly', description: 'Servicios amigables con el medio ambiente' },
  { name: 'Garantía', slug: 'garantia', description: 'Servicios con garantía incluida' },
  { name: 'Profesional', slug: 'profesional', description: 'Servicios con certificación profesional' },
  { name: 'Mujeres', slug: 'mujeres', description: 'Servicios prestados por mujeres' },
  { name: 'Estudiantil', slug: 'estudiantil', description: 'Descuentos especiales para estudiantes' },
  { name: 'Empresarial', slug: 'empresarial', description: 'Servicios orientados a empresas' },
  { name: 'Mascotas', slug: 'mascotas', description: 'Servicios relacionados con mascotas' },
]

// ─── BADGES ──────────────────────────────────────────────────────────────────

const BADGES = [
  { name: 'Excelente servicio', description: 'Calificación promedio mayor a 4.5', criteria: { minRating: 4.5 }, badgeType: 'CALIFICACION', icon: '⭐', priority: 50, autoAssign: true },
  { name: 'Buen servicio', description: 'Calificación promedio mayor a 4.0', criteria: { minRating: 4.0 }, badgeType: 'CALIFICACION', icon: '🌟', priority: 30, autoAssign: true },
  { name: 'Más solicitado', description: 'Más de 10 solicitudes completadas', criteria: { minCompleted: 10 }, badgeType: 'SOLICITUDES', icon: '📋', priority: 40, autoAssign: true },
  { name: 'Proveedor confiable', description: 'Más de 5 solicitudes completadas', criteria: { minCompleted: 5 }, badgeType: 'SOLICITUDES', icon: '✅', priority: 20, autoAssign: true },
  { name: 'Verificado', description: 'Identidad verificada manualmente', criteria: { manual: true }, badgeType: 'VERIFICADO', icon: '🔵', priority: 60, autoAssign: false },
  { name: 'Recomendado', description: 'Más de 20 favoritos', criteria: { minFavoritos: 20 }, badgeType: 'RECOMENDADO', icon: '🏆', priority: 80, autoAssign: true },
  { name: 'Popular', description: 'Más de 10 favoritos', criteria: { minFavoritos: 10 }, badgeType: 'RECOMENDADO', icon: '🔥', priority: 40, autoAssign: true },
]

// ─── SERVICIOS ───────────────────────────────────────────────────────────────

const SERVICES_DATA = [
  { cat: 'Limpieza', nombre: 'Limpieza Profunda de Hogar', descripcion: 'Limpieza completa para tu hogar. Incluye cocina, baños, pisos, ventanas y muebles. Trabajamos con productos eco-friendly y equipos profesionales. Ideal para mudanzas o limpieza semanal.', telefono: '55551234', dueno: 2, featured: true, tags: [0, 2, 5], avgRating: 4.7, reviewsCount: 14, viewsCount: 890, favCount: 45 },
  { cat: 'Jardinería', nombre: 'Mantenimiento de Jardín Completo', descripcion: 'Corte de césped, poda de árboles y arbustos, deshierbe, abono y diseño de jardines. Servicio semanal, quincenal o mensual. Incluye recolección de escombros verdes.', telefono: '55552345', dueno: 2, featured: true, tags: [3, 5, 7], avgRating: 4.5, reviewsCount: 9, viewsCount: 567, favCount: 28 },
  { cat: 'Plomería', nombre: 'Servicio de Plomería General', descripcion: 'Reparación de fugas de agua, cambio de grifos, destape de drenajes, instalación de calentadores y tuberías. Atención de emergencias 24 horas. Garantía en todos los trabajos.', telefono: '55553456', dueno: 2, featured: true, tags: [0, 4, 6], avgRating: 4.3, reviewsCount: 22, viewsCount: 1230, favCount: 52 },
  { cat: 'Electricidad', nombre: 'Instalación y Reparación Eléctrica', descripcion: 'Instalación de cableado, tomacorrientes, interruptores, lámparas y tableros eléctricos. Reparación de cortocircuitos y fallas. Certificación y normativas de seguridad incluidas.', telefono: '55554567', dueno: 2, featured: false, tags: [4, 6, 7], avgRating: 4.1, reviewsCount: 18, viewsCount: 980, favCount: 35 },
  { cat: 'Pintura', nombre: 'Pintura Residencial y Comercial', descripcion: 'Pintura interior y exterior de casas, departamentos y oficinas. Incluye preparación de superficies, masillado, imprimación y dos capas de pintura. Colores personalizados.', telefono: '55555678', dueno: 3, featured: false, tags: [3, 7], avgRating: 4.4, reviewsCount: 11, viewsCount: 654, favCount: 22 },
  { cat: 'Carpintería', nombre: 'Fabricación de Muebles a Medida', descripcion: 'Diseño y fabricación de muebles de madera a medida: roperos, estanterías, mesas, cocinas integrales y puertas. Trabajamos con madera de pino, cedro y caoba.', telefono: '55556789', dueno: 3, featured: true, tags: [2, 6, 10], avgRating: 4.8, reviewsCount: 7, viewsCount: 432, favCount: 19 },
  { cat: 'Cerrajería', nombre: 'Apertura y Cambio de Cerraduras', descripcion: 'Apertura de puertas sin daño, cambio de cerraduras, instalación de candados de seguridad, llaves maestras y sistemas de acceso biométrico. Servicio de emergencia 24 horas.', telefono: '55557890', dueno: 3, featured: false, tags: [0, 4], avgRating: 4.2, reviewsCount: 15, viewsCount: 876, favCount: 31 },
  { cat: 'Mecánica automotriz', nombre: 'Mantenimiento Preventivo de Vehículos', descripcion: 'Cambio de aceite, filtros, balatas, alineación, balanceo, revisión de frenos y motor. Servicio para carros y camionetas. Presupuesto sin compromiso. Garantía de 3 meses.', telefono: '55558901', dueno: 3, featured: false, tags: [6, 7], avgRating: 4.0, reviewsCount: 25, viewsCount: 1456, favCount: 48 },
  { cat: 'Lavado de autos', nombre: 'Lavado y Detailing Profesional', descripcion: 'Lavado exterior e interior completo, aspirado, limpieza de tapicería, pulido de pintura y aplicación de cera de alta duración. Servicio a domicilio o en nuestro local.', telefono: '55559012', dueno: 4, featured: false, tags: [3, 1], avgRating: 4.6, reviewsCount: 30, viewsCount: 2100, favCount: 73 },
  { cat: 'Mudanzas y fletes', nombre: 'Servicio de Mudanza Integral', descripcion: 'Mudanza completa de hogares y oficinas. Incluye embalaje, carga, traslado y descarga. Contamos con personal capacitado, cinta adhesiva, cajas y vehículos adecuados.', telefono: '55550123', dueno: 4, featured: false, tags: [0, 10], avgRating: 3.9, reviewsCount: 20, viewsCount: 1100, favCount: 40 },
  { cat: 'Delivery y mensajería', nombre: 'Entrega a Domicilio Rápida', descripcion: 'Entrega de paquetes, documentos, compras y alimentos en toda la ciudad. Rastreo en tiempo real. Entrega el mismo día para pedidos antes de las 2pm. Tarifas por kilómetro.', telefono: '55561234', dueno: 4, featured: false, tags: [1, 3, 0], avgRating: 4.3, reviewsCount: 40, viewsCount: 3200, favCount: 95 },
  { cat: 'Peluquería y barbería', nombre: 'Corte y Estilismo Profesional', descripcion: 'Corte de cabello moderno para hombre y mujer, barba, tintes, mechas, alisado y tratamientos capilares. Atención a domicilio o en nuestro salón. Citas flexibles.', telefono: '55562345', dueno: 4, featured: false, tags: [3, 8], avgRating: 4.4, reviewsCount: 16, viewsCount: 789, favCount: 34 },
  { cat: 'Cocina y catering', nombre: 'Catering para Eventos y Fiestas', descripcion: 'Servicio de comida para bodas, quinceañeros, bautizos, fiestas empresariales y reuniones. Menú personalizado con opciones de desayuno, almuerzo y cena. Incluye meseros y equipo.', telefono: '55563456', dueno: 2, featured: true, tags: [2, 10], avgRating: 4.9, reviewsCount: 12, viewsCount: 980, favCount: 55 },
  { cat: 'Fotografía', nombre: 'Fotografía Profesional de Eventos', descripcion: 'Cobertura fotográfica de bodas, quinceañeros, bautizos, graduaciones y eventos corporativos. Álbum digital, impresiones y sesión pre-evento incluida. Dron disponible.', telefono: '55564567', dueno: 3, featured: false, tags: [2, 7], avgRating: 4.5, reviewsCount: 18, viewsCount: 1200, favCount: 60 },
  { cat: 'Paseo de mascotas', nombre: 'Paseo y Cuidado de Mascotas', descripcion: 'Paseo diario de perros por 30 o 60 minutos. Cuidado y alimentación mientras estás fuera. Servicio confiable con experiencia en diferentes razas y tamaños. Vacunas al día.', telefono: '55565678', dueno: 4, featured: false, tags: [3, 11], avgRating: 4.2, reviewsCount: 8, viewsCount: 345, favCount: 16 },
  { cat: 'Niñeras', nombre: 'Cuidado de Niños a Domicilio', descripcion: 'Niñeras profesionales con experiencia en cuidado infantil. Disponible para media jornada, jornada completa o noches. Referencias verificadas, CPR certification y seguro incluido.', telefono: '55566789', dueno: 2, featured: false, tags: [3, 8, 7], avgRating: 4.6, reviewsCount: 13, viewsCount: 567, favCount: 29 },
  { cat: 'Reparación de electrodomésticos', nombre: 'Reparación de Electrodomésticos del Hogar', descripcion: 'Reparación de refrigeradores, lavadoras, secadoras, estufas, microondas y más. Diagnóstico gratuito. Reparación en tu hogar con garantía en mano de obra y repuestos originales.', telefono: '55567890', dueno: 3, featured: false, tags: [3, 6, 4], avgRating: 4.1, reviewsCount: 27, viewsCount: 1450, favCount: 50 },
  { cat: 'Tecnología', nombre: 'Soporte Técnico de Computadoras', descripcion: 'Reparación y mantenimiento de computadoras de escritorio y laptops. Instalación de software, formateo, limpieza física, cambio de piezas y recuperación de datos. Servicio a domicilio.', telefono: '55568901', dueno: 4, featured: false, tags: [3, 7, 0], avgRating: 4.3, reviewsCount: 19, viewsCount: 890, favCount: 38 },
  { cat: 'Salud y bienestar', nombre: 'Masajes Relajantes y Terapéuticos', descripcion: 'Masaje sueco, masaje deportivo, masaje de tejido profundo y aromaterapia. Sesiones de 60 o 90 minutos en la comodidad de tu hogar. Profesional certificado con más de 5 años de experiencia.', telefono: '55569012', dueno: 2, featured: true, tags: [3, 2, 7], avgRating: 4.8, reviewsCount: 21, viewsCount: 1340, favCount: 67 },
  { cat: 'Clases particulares', nombre: 'Clases de Inglés Personalizadas', descripcion: 'Clases de inglés desde nivel básico hasta avanzado. Enfoque conversacional, preparación para exámenes TOEFL/IELTS. Horarios flexibles. Material didáctico incluido. Primera clase gratis.', telefono: '55570123', dueno: 3, featured: false, tags: [3, 9], avgRating: 4.4, reviewsCount: 10, viewsCount: 456, favCount: 21 },
]

// ─── RESEÑAS ─────────────────────────────────────────────────────────────────

const REVIEWS_DATA = [
  { servicioIdx: 0, usuarioId: 5, calificacion: 5, comentario: 'Excelente servicio de limpieza. Dejaron mi casa impecable y usaron productos que no dañan el medio ambiente. Muy recomendados.' },
  { servicioIdx: 0, usuarioId: 6, calificacion: 4, comentario: 'Buen servicio, puntuales y profesionales. La cocina quedó perfecta. Solo mejorarían la limpieza de ventanas.' },
  { servicioIdx: 1, usuarioId: 5, calificacion: 5, comentario: 'Transformaron mi jardín por completo. Ahora tengo un espacio hermoso para compartir en familia. Muy agradecido.' },
  { servicioIdx: 2, usuarioId: 6, calificacion: 4, comentario: 'Llegaron rápido para una emergencia de tubería rota. Solucionaron el problema en menos de una hora. Muy profesionales.' },
  { servicioIdx: 2, usuarioId: 5, calificacion: 5, comentario: 'La mejor plomería que he contratado. Precios justos y trabajo de calidad. Definitivamente los recomendaré a mis vecinos.' },
  { servicioIdx: 3, usuarioId: 6, calificacion: 4, comentario: 'Realizaron la instalación eléctrica de mi oficina. Todo en orden y con las certificaciones requeridas. Muy buen trabajo.' },
  { servicioIdx: 4, usuarioId: 5, calificacion: 5, comentario: 'Pintaron mi casa entera en solo 3 días. Quedó preciosa, los colores vibrantes y las líneas muy limpias. Excelente.' },
  { servicioIdx: 5, usuarioId: 6, calificacion: 5, comentario: 'El mueble que me fabricaron es una obra de arte. La madera de cedro de primera calidad y el acabado impecable.' },
  { servicioIdx: 8, usuarioId: 5, calificacion: 5, comentario: 'Mi carro quedó como nuevo después del detailing. Limpiaron hasta el motor. Muy recomendados para los amantes de los autos.' },
  { servicioIdx: 8, usuarioId: 6, calificacion: 4, comentario: 'Buen servicio de lavado a domicilio. Llegaron puntuales y dejaron el auto impecable por dentro y por fuera.' },
  { servicioIdx: 12, usuarioId: 5, calificacion: 5, comentario: 'El catering para mi boda fue espectacular. Todos los invitados quedaron encantados con la comida y la presentación.' },
  { servicioIdx: 14, usuarioId: 6, calificacion: 4, comentario: 'Mi perro disfruta mucho sus paseos con ellos. Son responsables y cariñosos con los animales. Muy buen servicio.' },
  { servicioIdx: 15, usuarioId: 5, calificacion: 5, comentario: 'La niñera fue increíble con mis hijos. Llegó puntual, siguió todas las instrucciones y los niños la adoraron. Contrataré de nuevo.' },
  { servicioIdx: 18, usuarioId: 6, calificacion: 5, comentario: 'El masaje de aromaterapia fue exactamente lo que necesitaba. Salí renovada y sin estrés. Profesional con excelentes manos.' },
  { servicioIdx: 3, usuarioId: 5, calificacion: 3, comentario: 'El trabajo eléctrico fue bueno pero un poco caro para lo que hicieron. Sin embargo, todo funciona correctamente.' },
  { servicioIdx: 7, usuarioId: 6, calificacion: 4, comentario: 'Le hicieron manteniendo a mi camioneta. Cambiaron aceite, filtros y revisaron frenos. Buen servicio y precio razonable.' },
  { servicioIdx: 9, usuarioId: 5, calificacion: 4, comentario: 'La mudanza fue rápida y sin contratiempos. Cuidaron muy bien mis muebles y todo llegó en perfectas condiciones.' },
  { servicioIdx: 11, usuarioId: 6, calificacion: 5, comentario: 'Me encantó mi nuevo corte de cabello. La estilista entendió exactamente lo que quería. Volveré sin duda.' },
  { servicioIdx: 13, usuarioId: 5, calificacion: 5, comentario: 'Las fotos de la graduación de mi hija quedaron hermosas. Capturaron cada momento especial. Muy profesionales.' },
  { servicioIdx: 17, usuarioId: 6, calificacion: 4, comentario: 'Repararon mi laptop que no encendía. Diagnóstico preciso y reparación rápida. Quedó funcionando como nueva.' },
]

// ─── FAVORITOS ───────────────────────────────────────────────────────────────

const FAVORITES_DATA = [
  { usuarioId: 5, servicioIdx: 0, notes: 'Limpieza semanal' },
  { usuarioId: 5, servicioIdx: 2, notes: 'Emergencia plomería' },
  { usuarioId: 5, servicioIdx: 12, notes: 'Para mi boda' },
  { usuarioId: 5, servicioIdx: 18, notes: 'Masajes mensuales' },
  { usuarioId: 6, servicioIdx: 1, notes: 'Jardín de la casa' },
  { usuarioId: 6, servicioIdx: 8, notes: 'Lavado de mi carro' },
  { usuarioId: 6, servicioIdx: 14, notes: 'Paseo de Toby' },
  { usuarioId: 6, servicioIdx: 17, notes: 'Reparación PC' },
  { usuarioId: 5, servicioIdx: 10, notes: 'Delivery rápido' },
  { usuarioId: 6, servicioIdx: 3, notes: 'Electricista de confianza' },
]

// ─── SOLICITUDES ─────────────────────────────────────────────────────────────

const SOLICITUDES_DATA = [
  { usuarioId: 5, servicioIdx: 0, descripcion: 'Necesito limpieza profunda para mi casa de 3 habitaciones el próximo sábado.', priceEstimate: 350, status: 'completed', proveedorId: 2 },
  { usuarioId: 6, servicioIdx: 2, descripcion: 'Se rompió una tubería en la cocina, necesito ayuda urgente.', priceEstimate: 500, status: 'completed', proveedorId: 2 },
  { usuarioId: 5, servicioIdx: 8, descripcion: 'Quiero lavado y detailing completo para mi Toyota Corolla 2020.', priceEstimate: 250, status: 'accepted', proveedorId: 4 },
  { usuarioId: 6, servicioIdx: 18, descripcion: 'Me gustaría una sesión de masaje relajante de 90 minutos a domicilio.', priceEstimate: 400, status: 'pending' },
  { usuarioId: 5, servicioIdx: 12, descripcion: 'Cotización para catering de 50 personas en evento familiar.', priceEstimate: 3000, status: 'pending' },
  { usuarioId: 6, servicioIdx: 14, descripcion: 'Necesito paseo para mi perro Golden Retriever todos los días a las 2pm.', priceEstimate: 200, status: 'rejected' },
  { usuarioId: 5, servicioIdx: 3, descripcion: 'Instalación de 5 tomacorrientes nuevos y un interruptor general.', priceEstimate: 600, status: 'cancelled' },
  { usuarioId: 6, servicioIdx: 1, descripcion: 'Mantenimiento mensual de jardín, poda de árboles y corte de césped.', priceEstimate: 450, status: 'accepted', proveedorId: 2 },
  { usuarioId: 5, servicioIdx: 10, descripcion: 'Entrega de un paquete urgente a Zona 14 antes de las 5pm.', priceEstimate: 50, status: 'completed', proveedorId: 4 },
  { usuarioId: 6, servicioIdx: 17, descripcion: 'Mi laptop no enciende, necesito diagnóstico y reparación a domicilio.', priceEstimate: 350, status: 'pending' },
  { usuarioId: 5, servicioIdx: 5, descripcion: 'Quiero un ropero empotrado de 2 metros de ancho en cedro.', priceEstimate: 2500, status: 'completed', proveedorId: 3 },
  { usuarioId: 6, servicioIdx: 7, descripcion: 'Cambio de aceite y revisión general para mi Honda Civic 2018.', priceEstimate: 400, status: 'completed', proveedorId: 3 },
]

// ─── REPORTES ────────────────────────────────────────────────────────────────

const REPORTES_DATA = [
  { servicioIdx: 7, usuarioId: 5, motivo: 'informacion_falsa', descripcion: 'El precio publicado no coincide con el presupuesto que me dieron. Publican barato para atraer clientes.', reportType: 'contenido_falso', severity: 'medium' },
  { servicioIdx: 9, usuarioId: 6, motivo: 'spam', descripcion: 'Este servicio aparece duplicado varias veces en la lista. Deberían consolidar las publicaciones.', reportType: 'spam', severity: 'low' },
  { servicioIdx: 16, usuarioId: 5, motivo: 'otro', descripcion: 'El técnico llegó tarde y no completó la reparación. Tuve que llamar a otro servicio.', reportType: 'abuso', severity: 'high' },
]

// ─── LOGS ────────────────────────────────────────────────────────────────────

const LOGS_DATA = [
  { action: 'LOGIN', affectedEntity: 'User', detail: 'Admin inició sesión', severity: 'LOW' },
  { action: 'CREATE', affectedEntity: 'Service', detail: 'Carlos creó servicio: Limpieza Profunda de Hogar', severity: 'LOW' },
  { action: 'SERVICE_REQUESTED', affectedEntity: 'Solicitud', detail: 'Ana solicitó: Limpieza Profunda de Hogar', severity: 'MEDIUM' },
  { action: 'UPDATE', affectedEntity: 'Service', detail: 'Carlos actualizó disponibilidad del servicio de Plomería', severity: 'LOW' },
  { action: 'REVIEW_POSTED', affectedEntity: 'Review', detail: 'Ana publicó reseña de 5 estrellas en Limpieza Profunda', severity: 'LOW' },
  { action: 'DELETE', affectedEntity: 'User', detail: 'Admin eliminó usuario inactivo ID 7', severity: 'HIGH', immutable: true },
]

// ─── AVAILABILITY HELPER ─────────────────────────────────────────────────────

const DEFAULT_AVAILABILITY = [
  { day: 'lunes', open: '08:00', close: '17:00' },
  { day: 'martes', open: '08:00', close: '17:00' },
  { day: 'miercoles', open: '08:00', close: '17:00' },
  { day: 'jueves', open: '08:00', close: '17:00' },
  { day: 'viernes', open: '08:00', close: '17:00' },
  { day: 'sabado', open: '09:00', close: '14:00' },
]

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN SEED
// ═══════════════════════════════════════════════════════════════════════════════

async function seed() {
  try {
    console.log('\n🔌 Conectando a MongoDB...')
    await mongoose.connect(process.env.URI_MONGO, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 })
    console.log('✅ MongoDB conectado.\n')

    // ── 1. USUARIOS (PostgreSQL) ─────────────────────────────────────────────
    console.log('━━━ 👥 USUARIOS ━━━')
    const createdUsers = []
    for (const u of USERS) {
      const existing = await User.findOne({ where: { email: u.email } })
      if (existing) {
        console.log(`⏭️  Ya existe: ${u.email}`)
        createdUsers.push(existing)
        continue
      }
      const hashed = await bcrypt.hash(u.password, 10)
      const user = await User.create({ ...u, password: hashed, emailVerified: u.emailVerified })
      console.log(`✅ Creado: ${user.name} ${user.surname} (${user.role})`)
      createdUsers.push(user)
    }
    const admin = createdUsers[0]
    const duenos = createdUsers.filter(u => u.role === 'DUENO_ROLE')
    const users = createdUsers.filter(u => u.role === 'USER_ROLE')

    // ── 2. CATEGORÍAS ────────────────────────────────────────────────────────
    console.log('\n━━━ 📂 CATEGORÍAS ━━━')
    await Category.deleteMany({})
    const catMap = {}
    for (const cat of CATEGORIES) {
      const created = await Category.create(cat)
      catMap[cat.nombre] = created._id
      console.log(`✅ ${cat.nombre}`)
    }

    // ── 3. UBICACIONES ───────────────────────────────────────────────────────
    console.log('\n━━━ 📍 UBICACIONES ━━━')
    await Location.deleteMany({})
    const locMap = {}
    for (const loc of LOCATIONS) {
      const created = await Location.create(loc)
      locMap[loc.name] = created._id
      console.log(`✅ ${loc.name} (${loc.municipality}, ${loc.department})`)
    }

    // ── 4. TAGS ──────────────────────────────────────────────────────────────
    console.log('\n━━━ 🏷️  TAGS ━━━')
    await Tag.deleteMany({})
    const tagIds = []
    for (const tag of TAGS) {
      const created = await Tag.create(tag)
      tagIds.push(created._id)
      console.log(`✅ ${tag.name}`)
    }

    // ── 5. BADGES ────────────────────────────────────────────────────────────
    console.log('\n━━━ 🏅 BADGES ━━━')
    await Badge.deleteMany({})
    const badgeIds = []
    for (const badge of BADGES) {
      const created = await Badge.create(badge)
      badgeIds.push(created._id)
      console.log(`✅ ${badge.name}`)
    }

    // ── 6. SERVICIOS ─────────────────────────────────────────────────────────
    console.log('\n━━━ 🔧 SERVICIOS ───')
    await Service.deleteMany({})
    const locNames = Object.keys(locMap)
    const createdServices = []
    for (const svc of SERVICES_DATA) {
      const locName = locNames[Math.floor(Math.random() * locNames.length)]
      const tagSubset = svc.tags.map(i => tagIds[i])
      const assignedBadges = svc.avgRating >= 4.5 ? [badgeIds[0], badgeIds[5]] : svc.avgRating >= 4 ? [badgeIds[1], badgeIds[6]] : []
      const locationId = locMap[locName]
      const locationObj = LOCATIONS.find(l => l.name === locName)

      const service = await Service.create({
        nombre: svc.nombre,
        descripcion: svc.descripcion,
        categoriaId: catMap[svc.cat],
        locationId,
        tags: tagSubset,
        telefono: svc.telefono,
        contactEmail: `${svc.nombre.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
        usuarioId: svc.dueno,
        estado: 'activo',
        isFeatured: svc.featured,
        averageRating: svc.avgRating,
        reviewsCount: svc.reviewsCount,
        viewsCount: svc.viewsCount,
        favoritosCount: svc.favCount,
        availability: DEFAULT_AVAILABILITY,
        serviceAreaRadius: 10 + Math.floor(Math.random() * 20),
        badges: assignedBadges,
      })
      createdServices.push(service)
      console.log(`✅ ${svc.nombre} (★${svc.avgRating}) — ${svc.cat} — ${locationName(locationObj)}`)
    }

    // ── 7. RESEÑAS ───────────────────────────────────────────────────────────
    console.log('\n━━━ 💬 RESEÑAS ━━━')
    await Review.deleteMany({})
    for (const rev of REVIEWS_DATA) {
      const s = createdServices[rev.servicioIdx]
      await Review.create({
        servicioId: s._id,
        usuarioId: rev.usuarioId,
        calificacion: rev.calificacion,
        comentario: rev.comentario,
        title: rev.comentario.substring(0, 40),
        likesCount: Math.floor(Math.random() * 10),
        isVerifiedPurchase: Math.random() > 0.5,
        sentimentScore: rev.calificacion >= 4 ? 1 : rev.calificacion === 3 ? 0 : -1,
        sentimentLabel: rev.calificacion >= 4 ? 'positivo' : rev.calificacion === 3 ? 'neutro' : 'negativo',
      })
      console.log(`✅ Reseña de usuario ${rev.usuarioId} → ${s.nombre} (${rev.calificacion}★)`)
    }

    // ── 8. FAVORITOS ─────────────────────────────────────────────────────────
    console.log('\n━━━ ❤️ FAVORITOS ━━━')
    await Favorite.deleteMany({})
    for (const fav of FAVORITES_DATA) {
      const s = createdServices[fav.servicioIdx]
      await Favorite.create({
        usuarioId: fav.usuarioId,
        servicioId: s._id,
        notes: fav.notes,
        notificationEnabled: true,
        lastInteractionAt: new Date(),
      })
      console.log(`✅ Favorito: usuario ${fav.usuarioId} → ${s.nombre}`)
    }

    // ── 9. SOLICITUDES ───────────────────────────────────────────────────────
    console.log('\n━━━ 📋 SOLICITUDES ━━━')
    await Solicitud.deleteMany({})
    for (const sol of SOLICITUDES_DATA) {
      const s = createdServices[sol.servicioIdx]
      const historial = [
        { estado: 'pending', cambiadoPor: sol.usuarioId, fecha: new Date(Date.now() - 86400000 * 7), observacion: 'Solicitud creada' },
      ]
      if (sol.status === 'accepted' || sol.status === 'completed' || sol.status === 'rejected') {
        historial.push({ estado: 'accepted', cambiadoPor: sol.proveedorId || 1, fecha: new Date(Date.now() - 86400000 * 5), observacion: 'Solicitud aceptada' })
      }
      if (sol.status === 'completed') {
        historial.push({ estado: 'completed', cambiadoPor: sol.proveedorId || 1, fecha: new Date(Date.now() - 86400000 * 2), observacion: 'Servicio completado satisfactoriamente' })
      }
      if (sol.status === 'rejected') {
        historial.push({ estado: 'rejected', cambiadoPor: sol.proveedorId || 1, fecha: new Date(Date.now() - 86400000 * 4), observacion: 'No disponible en las fechas solicitadas' })
      }
      if (sol.status === 'cancelled') {
        historial.push({ estado: 'cancelled', cambiadoPor: sol.usuarioId, fecha: new Date(Date.now() - 86400000 * 3), observacion: 'Cancelado por el usuario' })
      }

      await Solicitud.create({
        usuarioId: sol.usuarioId,
        proveedorId: sol.proveedorId || null,
        servicioId: s._id,
        descripcion: sol.descripcion,
        status: sol.status,
        priceEstimate: sol.priceEstimate,
        fechaSolicitud: new Date(Date.now() - 86400000 * 7),
        acceptedAt: sol.status === 'accepted' || sol.status === 'completed' ? new Date(Date.now() - 86400000 * 5) : null,
        completedAt: sol.status === 'completed' ? new Date(Date.now() - 86400000 * 2) : null,
        chatEnabled: sol.status === 'accepted' || sol.status === 'completed',
        historialEstados: historial,
      })
      console.log(`✅ Solicitud: usuario ${sol.usuarioId} → ${s.nombre} [${sol.status}]`)
    }

    // ── 10. REPORTES ─────────────────────────────────────────────────────────
    console.log('\n━━━ 🚨 REPORTES ━━━')
    await Reporte.deleteMany({})
    for (const rep of REPORTES_DATA) {
      const s = createdServices[rep.servicioIdx]
      await Reporte.create({
        servicioId: s._id,
        usuarioId: rep.usuarioId,
        motivo: rep.motivo,
        descripcion: rep.descripcion,
        reportType: rep.reportType,
        severity: rep.severity,
        status: 'pending',
      })
      console.log(`✅ Reporte: usuario ${rep.usuarioId} → ${s.nombre}`)
    }

    // ── 11. LOGS ─────────────────────────────────────────────────────────────
    console.log('\n━━━ 📝 LOGS ━━━')
    await ActivityLog.deleteMany({})
    const dummyUserId = new mongoose.Types.ObjectId()
    for (const log of LOGS_DATA) {
      await ActivityLog.create({
        userId: dummyUserId,
        action: log.action,
        affectedEntity: log.affectedEntity,
        detail: log.detail,
        severity: log.severity,
        immutable: log.immutable || false,
        ipAddress: '127.0.0.1',
        userAgent: 'Seed Script',
        lastOccurrence: new Date(),
      })
      console.log(`✅ ${log.action} — ${log.detail}`)
    }

    // ── RESUMEN ──────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════')
    console.log('        🎉 SEED COMPLETADO EXITOSAMENTE')
    console.log('═══════════════════════════════════════════════')
    console.log(`\n📊 Resumen:`)
    console.log(`   👥 Usuarios:        ${createdUsers.length}`)
    console.log(`   📂 Categorías:      ${CATEGORIES.length}`)
    console.log(`   📍 Ubicaciones:     ${LOCATIONS.length}`)
    console.log(`   🏷️  Tags:            ${TAGS.length}`)
    console.log(`   🏅 Badges:          ${BADGES.length}`)
    console.log(`   🔧 Servicios:       ${createdServices.length}`)
    console.log(`   💬 Reseñas:         ${REVIEWS_DATA.length}`)
    console.log(`   ❤️ Favoritos:        ${FAVORITES_DATA.length}`)
    console.log(`   📋 Solicitudes:     ${SOLICITUDES_DATA.length}`)
    console.log(`   🚨 Reportes:        ${REPORTES_DATA.length}`)
    console.log(`   📝 Logs:            ${LOGS_DATA.length}`)
    console.log(`\n🔐 Credenciales:`)
    console.log(`   👑 Admin:  admin@gestionservicios.com / Admin123!`)
    console.log(`   👤 Dueño:  carlos@email.com / Password1!`)
    console.log(`   👤 Dueño:  maria@email.com / Password1!`)
    console.log(`   👤 Usuario: ana@email.com / Password1!`)
    console.log(`   👤 Usuario: luis@email.com / Password1!`)
    console.log(`\n✅ Seed finalizado.`)

  } catch (error) {
    console.error('\n❌ Error en seed:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

function locationName(loc) {
  return loc ? `${loc.municipality}, ${loc.department}` : 'Desconocida'
}

seed()
