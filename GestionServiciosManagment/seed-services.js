import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/fields/categories/categories.model.js';
import Location from './src/fields/location/location.model.js';
import Service from './src/fields/services/services.model.js';

dotenv.config();

const ADMIN_USER_ID = 1;

const categories = [
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
  { nombre: 'Delivery/mensajería', descripcion: 'Entrega a domicilio de paquetes, documentos y compras' },
  { nombre: 'Peluquería y barbería', descripcion: 'Corte de cabello, barba, tintes y tratamientos capilares' },
  { nombre: 'Cocina/catering', descripcion: 'Servicio de comidas para eventos, fiestas y reuniones' },
  { nombre: 'Fotografía', descripcion: 'Fotografía profesional, bodas, eventos y sesiones de retrato' },
  { nombre: 'Paseo de mascotas', descripcion: 'Paseo y cuidado de perros y mascotas a domicilio' },
  { nombre: 'Niñeras', descripcion: 'Cuidado de niños a domicilio, guardería y acompañamiento' },
  { nombre: 'Reparación de electrodomésticos', descripcion: 'Reparación de refrigeradores, lavadoras, estufas y más' },
];

const services = [
  {
    cat: 'Limpieza',
    nombre: 'Limpieza Profunda de Hogar',
    descripcion: 'Servicio de limpieza completa para tu hogar. Incluye cocina, baños, pisos, ventanas y muebles. Trabajamos con productos eco-friendly y equipos profesionales. Ideal para mudanzas o limpieza semanal.',
    telefono: '55551234',
  },
  {
    cat: 'Jardinería',
    nombre: 'Mantenimiento de Jardín Completo',
    descripcion: 'Corte de césped, poda de árboles y arbustos, deshierbe, abono y diseño de jardines. Servicio semanal, quincenal o mensual. Incluye recolección de escombros verdes.',
    telefono: '55552345',
  },
  {
    cat: 'Plomería',
    descripcion: 'Reparación de fugas de agua, cambio de grifos, destape de drenajes, instalación de calentadores y tuberías. Atención de emergencias 24 horas. Garantía en todos los trabajos.',
    nombre: 'Servicio de Plomería General',
    telefono: '55553456',
  },
  {
    cat: 'Electricidad',
    nombre: 'Instalación y Reparación Eléctrica',
    descripcion: 'Instalación de cableado, tomacorrientes, interruptores, lámparas y tableros eléctricos. Reparación de cortocircuitos y fallas. Certificación y normativas de seguridad incluidas.',
    telefono: '55554567',
  },
  {
    cat: 'Pintura',
    nombre: 'Pintura Residencial y Comercial',
    descripcion: 'Pintura interior y exterior de casas, departamentos y oficinas. Incluye preparación de superficies, masillado, imprimación y dos capas de pintura. Colores personalizados.',
    telefono: '55555678',
  },
  {
    cat: 'Carpintería',
    nombre: 'Fabricación de Muebles a Medida',
    descripcion: 'Diseño y fabricación de muebles de madera a medida: roperos, estanterías, mesas, cocinas integrales y puertas. Trabajamos con madera de pino, cedro y其它 materiales.',
    telefono: '55556789',
  },
  {
    cat: 'Cerrajería',
    nombre: 'Apertura y Cambio de Cerraduras',
    descripcion: 'Apertura de puertas sin daño, cambio de cerraduras, instalación de candados de seguridad, llaves maestras y sistemas de acceso. Servicio de emergencia 24 horas.',
    telefono: '55557890',
  },
  {
    cat: 'Mecánica automotriz',
    nombre: 'Mantenimiento Preventivo de Vehículos',
    descripcion: 'Cambio de aceite, filtros, balatas, alineación, balanceo, revisión de frenos y motor. Servicio para carros y camionetas. Presupuesto sin compromiso.',
    telefono: '55558901',
  },
  {
    cat: 'Lavado de autos',
    nombre: 'Lavado y Detailing Profesional',
    descripcion: 'Lavado exterior e interior completo, aspirado, limpieza de tapicería, pulido de pintura y aplicación de cera. Servicio a domicilio o en nuestro local.',
    telefono: '55559012',
  },
  {
    cat: 'Mudanzas y fletes',
    nombre: 'Servicio de Mudanza Integral',
    descripcion: 'Mudanza completa de hogares y oficinas. Incluye embalaje, carga, traslado y descarga. Contamos con personal capacitado y vehículos adecuados para cualquier tamaño.',
    telefono: '55550123',
  },
  {
    cat: 'Delivery/mensajería',
    nombre: 'Entrega a Domicilio Rápida',
    descripcion: 'Entrega de paquetes, documentos, compras y alimentos en toda la ciudad. Rastreo en tiempo real. Entrega el mismo día para pedidos antes de las 2pm.',
    telefono: '55561234',
  },
  {
    cat: 'Peluquería y barbería',
    nombre: 'Corte y Estilismo Profesional',
    descripcion: 'Corte de cabello moderno para hombre y mujer, barba, tintes, mechas, alisado y tratamientos capilares. Atención a domicilio o en nuestro salón. Citas flexibles.',
    telefono: '55562345',
  },
  {
    cat: 'Cocina/catering',
    nombre: 'Catering para Eventos y Fiestas',
    descripcion: 'Servicio de comida para bodas, quinceañeros, bautizos, fiestas empresariales y reuniones. Menú personalizado con opciones de desayuno, almuerzo y cena. Incluye meseros y equipo.',
    telefono: '55563456',
  },
  {
    cat: 'Fotografía',
    nombre: 'Fotografía Profesional de Eventos',
    descripcion: 'Cobertura fotográfica de bodas, quinceañeros, bautizos, graduaciones y eventos corporativos. Álbum digital, impresiones y sesión pre-evento incluida.',
    telefono: '55564567',
  },
  {
    cat: 'Paseo de mascotas',
    nombre: 'Paseo y Cuidado de Mascotas',
    descripcion: 'Paseo diario de perros por 30 o 60 minutos. Cuidado y alimentación mientras estás fuera. Servicio confiable con experiencia en diferentes razas y tamaños.',
    telefono: '55565678',
  },
  {
    cat: 'Niñeras',
    nombre: 'Cuidado de Niños a Domicilio',
    descripcion: 'Niñeras profesionales con experiencia en cuidado infantil. Disponible para.media jornada, jornada completa o noches. Referencias y antecedentes verificados.',
    telefono: '55566789',
  },
  {
    cat: 'Reparación de electrodomésticos',
    nombre: 'Reparación de Electrodomésticos del Hogar',
    descripcion: 'Reparación de refrigeradores, lavadoras, secadoras, estufas, microondas y más. Diagnóstico gratuito. Reparación en tu hogar con garantía en mano de obra y repuestos.',
    telefono: '55567890',
  },
];

async function seed() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.URI_MONGO, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    console.log('MongoDB conectado.\n');

    // Limpiar colecciones existentes
    await Category.deleteMany({});
    await Service.deleteMany({});
    await Location.deleteMany({});
    console.log('Colecciones limpiadas.\n');

    // Crear ubicación por defecto
    const location = await Location.create({
      name: 'Ciudad de Guatemala',
      municipality: 'Guatemala',
      department: 'Guatemala',
      country: 'Guatemala',
      zona: 'Zona 1',
      lat: 14.6349,
      lng: -90.5069,
    });
    console.log(`Ubicación creada: ${location.name} (${location._id})\n`);

    // Crear categorías
    const categoryMap = {};
    for (const cat of categories) {
      const created = await Category.create({ nombre: cat.nombre, descripcion: cat.descripcion });
      categoryMap[cat.nombre] = created._id;
      console.log(`Categoría: ${cat.nombre}`);
    }
    console.log(`\n${categories.length} categorías creadas.\n`);

    // Crear servicios
    let count = 0;
    for (const svc of services) {
      await Service.create({
        nombre: svc.nombre,
        descripcion: svc.descripcion,
        categoriaId: categoryMap[svc.cat],
        locationId: location._id,
        telefono: svc.telefono,
        usuarioId: ADMIN_USER_ID,
        estado: 'activo',
        availability: [
          { day: 'Lunes', open: '08:00', close: '17:00' },
          { day: 'Martes', open: '08:00', close: '17:00' },
          { day: 'Miércoles', open: '08:00', close: '17:00' },
          { day: 'Jueves', open: '08:00', close: '17:00' },
          { day: 'Viernes', open: '08:00', close: '17:00' },
          { day: 'Sábado', open: '09:00', close: '14:00' },
        ],
        serviceAreaRadius: 10,
      });
      count++;
      console.log(`Servicio: ${svc.nombre} → ${svc.cat}`);
    }

    console.log(`\n${count} servicios creados.`);
    console.log('\nSeed completado exitosamente.');
  } catch (error) {
    console.error('Error en seed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
