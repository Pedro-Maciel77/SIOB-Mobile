import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

async function seedAdmin() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  const existing = await userRepo.findOne({
    where: { email: 'admin@siob.com' },
  });

  if (existing) {
    console.log('⚠️ Admin já existe, deletando...');
    await userRepo.remove(existing);
  }

  const admin = userRepo.create({
    name: 'Administrador',
    email: 'admin@siob.com',
    password: 'Admin123#', // 👈 senha final
    role: 'admin',
  });

  await userRepo.save(admin);

  console.log('✅ Admin criado com sucesso');
  await AppDataSource.destroy();
}

seedAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
