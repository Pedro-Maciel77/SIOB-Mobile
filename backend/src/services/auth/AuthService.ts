import jwt from 'jsonwebtoken';
import { UserRepository } from '../../repositories/UserRepository';
import { PasswordService } from './PasswordService';
import { AuditLogRepository } from '../../repositories/AuditLogRepository';


export class AuthService {
    private userRepository = new UserRepository();
    private passwordService = new PasswordService();
    private auditRepository = new AuditLogRepository();

    async login(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Credenciais inválidas');
        }

        const isValidPassword = await this.passwordService.comparePassword(
            password,
            user.password
        );

        if (!isValidPassword) {
            throw new Error('Credenciais inválidas');
        }

        // Gerar tokens
        const accessToken = this.generateAccessToken(user.id);

        // Log de auditoria
        await this.auditRepository.logAction({
            userId: user.id,
            action: 'login',
            entity: 'user',
            entityId: user.id,
            details: { ip: '127.0.0.1' } // Em produção, pegar do request
        });

        // Remove senha da resposta
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            tokens: {
                accessToken,
                expiresIn: 3600 // 1 hora
            }
        };
    }

    async register(userData: any) {
        // Verificar se email já existe
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email já cadastrado');
        }

        // Hash da senha
        const hashedPassword = await this.passwordService.hashPassword(
            userData.password
        );

        // Criar usuário
        const user = await this.userRepository.create({
            ...userData,
            password: hashedPassword,
            role: userData.role || 'user'
        });

        // Log de auditoria
        await this.auditRepository.logAction({
            userId: user.id,
            action: 'create',
            entity: 'user',
            entityId: user.id,
            details: { email: user.email, role: user.role }
        });

        // Gerar tokens
        const accessToken = this.generateAccessToken(user.id);
        // Remove senha da resposta
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            tokens: {
                accessToken,
                expiresIn: 3600
            }
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refresh-secret';
            const decoded = jwt.verify(refreshToken, secret) as { userId: string };

            const user = await this.userRepository.findById(decoded.userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            const newAccessToken = this.generateAccessToken(user.id);

            return {
                accessToken: newAccessToken,
                expiresIn: 3600
            };
        } catch (error) {
            throw new Error('Refresh token inválido');
        }
    }

    private generateAccessToken(userId: string): string {
       const secret = process.env.JWT_SECRET || 'secret';
        const expiresIn = '1h';

        return jwt.sign(
            { userId },      // payload
            secret,          // secret
            { expiresIn }    // opções
        );
    }
    async logout(userId: string, ip: string = '127.0.0.1') {
        await this.auditRepository.logAction({
            userId,
            action: 'logout',
            entity: 'user',
            entityId: userId,
            details: { ip }
        });
    }
}