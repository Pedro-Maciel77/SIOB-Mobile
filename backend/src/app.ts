import { AppDataSource } from './config/database';

async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado com sucesso!');
    
    // Testar conexão
    const result = await AppDataSource.query('SELECT NOW() as current_time');
    console.log(`🕐 Hora do banco: ${result[0].current_time}`);
    
    await AppDataSource.destroy();
    console.log('🔌 Conexão encerrada');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error);
    process.exit(1);
  }
}

initializeDatabase();