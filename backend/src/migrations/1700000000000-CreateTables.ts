import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1700000000000 implements MigrationInterface {
  name = 'CreateTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabela de usuários
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        registration VARCHAR(20),
        unit VARCHAR(50),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'supervisor', 'user', 'operator')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de municípios
    await queryRunner.query(`
      CREATE TABLE municipalities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de viaturas
    await queryRunner.query(`
      CREATE TABLE vehicles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        plate VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de ocorrências
    await queryRunner.query(`
      CREATE TABLE occurrences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type VARCHAR(50) NOT NULL CHECK (type IN ('acidente', 'resgate', 'incendio', 'atropelamento', 'outros')),
        municipality VARCHAR(100) NOT NULL,
        neighborhood VARCHAR(100),
        address TEXT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        occurrence_date TIMESTAMP NOT NULL,
        activation_date TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'finalizado', 'alerta')),
        victim_name VARCHAR(100),
        victim_contact VARCHAR(20),
        vehicle_id UUID REFERENCES vehicles(id),
        vehicle_number VARCHAR(20),
        description TEXT NOT NULL,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de relatórios
    await queryRunner.query(`
      CREATE TABLE reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content TEXT NOT NULL,
        occurrence_id UUID REFERENCES occurrences(id),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de imagens de ocorrências
    await queryRunner.query(`
      CREATE TABLE occurrence_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        filename VARCHAR(255) NOT NULL,
        path VARCHAR(500) NOT NULL,
        occurrence_id UUID REFERENCES occurrences(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabela de auditoria
    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(50) NOT NULL CHECK (action IN ('login', 'logout', 'create', 'update', 'delete', 'download')),
        entity VARCHAR(50) NOT NULL CHECK (entity IN ('user', 'occurrence', 'report', 'vehicle')),
        entity_id VARCHAR(100),
        details JSONB,
        changes JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Índices para performance
    await queryRunner.query(`
      CREATE INDEX idx_occurrences_status ON occurrences(status);
      CREATE INDEX idx_occurrences_type ON occurrences(type);
      CREATE INDEX idx_occurrences_municipality ON occurrences(municipality);
      CREATE INDEX idx_occurrences_created_by ON occurrences(created_by);
      CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS occurrence_images CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS reports CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS occurrences CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS vehicles CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS municipalities CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
  }
}