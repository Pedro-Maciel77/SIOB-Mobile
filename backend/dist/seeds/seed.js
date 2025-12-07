"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const Municipality_1 = require("../entities/Municipality");
const Vehicle_1 = require("../entities/Vehicle");
async function seed() {
    try {
        await database_1.AppDataSource.initialize();
        console.log('🔗 Conectado ao banco de dados');
        const userRepository = database_1.AppDataSource.getRepository(User_1.User);
        const municipalityRepository = database_1.AppDataSource.getRepository(Municipality_1.Municipality);
        const vehicleRepository = database_1.AppDataSource.getRepository(Vehicle_1.Vehicle);
        // Limpar tabelas (cuidado em produção!)
        await municipalityRepository.clear();
        await vehicleRepository.clear();
        await userRepository.clear();
        // Seed de municípios (Pernambuco)
        const municipalities = [
            { name: 'Recife', active: true },
            { name: 'Olinda', active: true },
            { name: 'Jaboatão dos Guararapes', active: true },
            { name: 'Paulista', active: true },
            { name: 'Camaragibe', active: true },
            { name: 'São Lourenço da Mata', active: true },
            { name: 'Moreno', active: true },
            { name: 'Cabo de Santo Agostinho', active: true },
            { name: 'Ipojuca', active: true }
        ];
        await municipalityRepository.save(municipalities);
        console.log(`✅ ${municipalities.length} municípios criados`);
        // Seed de viaturas
        const vehicles = [
            { plate: 'AR-973', name: 'Viatura Alpha', active: true },
            { plate: 'BR-456', name: 'Viatura Bravo', active: true },
            { plate: 'CR-789', name: 'Viatura Charlie', active: true },
            { plate: 'DR-012', name: 'Viatura Delta', active: true }
        ];
        await vehicleRepository.save(vehicles);
        console.log(`✅ ${vehicles.length} viaturas criadas`);
        // Seed de usuários
        const users = [
            {
                name: 'Administrador Sistema',
                email: 'admin@sistema.com',
                password: 'admin123',
                registration: '001',
                unit: 'Central',
                role: 'admin'
            },
            {
                name: 'Supervisor Geral',
                email: 'supervisor@sistema.com',
                password: 'super123',
                registration: '002',
                unit: 'Coordenação',
                role: 'supervisor'
            },
            {
                name: 'Operador Field',
                email: 'operador@sistema.com',
                password: 'operador123',
                registration: '003',
                unit: 'Campo',
                role: 'operator'
            }
        ];
        for (const userData of users) {
            const user = userRepository.create(userData);
            await userRepository.save(user);
        }
        console.log(`✅ ${users.length} usuários criados`);
        console.log('🎉 Seed concluído com sucesso!');
        // Credenciais de teste
        console.log('\n🔐 Credenciais de teste:');
        console.log('👑 Admin: admin@sistema.com / admin123');
        console.log('👨‍💼 Supervisor: supervisor@sistema.com / super123');
        console.log('👷 Operador: operador@sistema.com / operador123');
        await database_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('❌ Erro no seed:', error);
        process.exit(1);
    }
}
seed();
