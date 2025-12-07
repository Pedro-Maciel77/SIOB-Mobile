"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./config/database");
async function initializeDatabase() {
    try {
        await database_1.AppDataSource.initialize();
        console.log('✅ Banco de dados conectado com sucesso!');
        // Testar conexão
        const result = await database_1.AppDataSource.query('SELECT NOW() as current_time');
        console.log(`🕐 Hora do banco: ${result[0].current_time}`);
        await database_1.AppDataSource.destroy();
        console.log('🔌 Conexão encerrada');
    }
    catch (error) {
        console.error('❌ Erro ao conectar ao banco:', error);
        process.exit(1);
    }
}
initializeDatabase();
