import bcrypt from 'bcryptjs';
import User from './src/fields/user/user.model.js';

export const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ where: { email: 'admin@gestionservicios.com' } });
    if (existing) {
      console.log('Admin ya existe:', existing.email);
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const admin = await User.create({
      name: 'Admin',
      surname: 'Principal',
      username: 'admin',
      email: 'admin@gestionservicios.com',
      password: hashedPassword,
      role: 'ADMIN_ROLE',
      status: true,
      emailVerified: true,
    });

    console.log('Admin creado:', admin.email);
  } catch (error) {
    console.error('Error al crear admin:', error.message);
  }
};
