import 'dotenv/config';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';

async function createAdmin() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(User);

  const exists = await repo.findOne({ where: { email: 'admin@siob.com' } });
  if (exists) {
    console.log('Admin já existe');
    process.exit(0);
  }

  const admin = repo.create({
    name: 'Administrador',
    email: 'admin@siob.com',
    password: await bcrypt.hash('123456', 10),
    role: 'admin',
  });

  await repo.save(admin);
  console.log('✅ Admin criado');
  process.exit(0);
}

createAdmin().catch(console.error);
