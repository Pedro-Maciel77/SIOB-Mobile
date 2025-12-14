import { OccurrenceRepository } from '../../repositories/OccurrenceRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { VehicleRepository } from '../../repositories/VehicleRepository';
import { AuditLogRepository } from '../../repositories/AuditLogRepository';

export class OccurrenceService {
  private occurrenceRepository = new OccurrenceRepository();
  private userRepository = new UserRepository();
  private vehicleRepository = new VehicleRepository();
  private auditRepository = new AuditLogRepository();

  async createOccurrence(data: any, userId: string) {
    // Validar dados
    this.validateOccurrenceData(data);

    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar viatura se fornecida
    if (data.vehicleId) {
      const vehicle = await this.vehicleRepository.findById(data.vehicleId);
      if (!vehicle) {
        throw new Error('Viatura não encontrada');
      }
    }

    // Criar ocorrência
    const occurrence = await this.occurrenceRepository.create({
      ...data,
      createdBy: { id: userId } as any
    });

    // Log de auditoria
    await this.auditRepository.logAction({
      userId,
      action: 'create',
      entity: 'occurrence',
      entityId: occurrence.id,
      details: {
        type: occurrence.type,
        municipality: occurrence.municipality,
        status: occurrence.status
      }
    });

    return occurrence;
  }

  async updateOccurrence(id: string, data: any, userId: string) {
    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) {
      throw new Error('Ocorrência não encontrada');
    }

    // Verificar permissões (admin/supervisor ou criador)
    const user = await this.userRepository.findById(userId);
    if (user && user.role !== 'admin' && user.role !== 'supervisor' && occurrence.createdBy.id !== user.id) {
    throw new Error('Permissao negada para editar esta ocorrencia');
    }

    // Capturar alterações
    const changes = this.getChanges(occurrence, data);

    // Atualizar
    const updated = await this.occurrenceRepository.update(id, data);

    // Log de auditoria se houver mudanças
    if (Object.keys(changes).length > 0) {
      await this.auditRepository.logAction({
        userId,
        action: 'update',
        entity: 'occurrence',
        entityId: id,
        changes,
        details: { reason: 'Atualização manual' }
      });
    }

    return updated;
  }

  async getOccurrenceById(id: string) {
    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) {
      throw new Error('Ocorrência não encontrada');
    }
    return occurrence;
  }

  async listOccurrences(filters: any, userId: string) {
    const user = await this.userRepository.findById(userId);
    
    // Se não for admin/supervisor, só mostra suas ocorrências
    if (user && user.role !== 'admin' && user.role !== 'supervisor') {
    filters.createdBy = userId;
}

    const result = await this.occurrenceRepository.findWithFilters(filters);
    
    // Log de consulta para admin/supervisor
    if (user && (user.role === 'admin' || user.role === 'supervisor')) {
    await this.auditRepository.logAction({
        userId,
        action: 'download',
        entity: 'occurrence',
        details: {
          filters,
          count: result.occurrences.length,
          total: result.total
        }
      });
    }

    return result;
  }

  async updateStatus(id: string, status: string, userId: string, reason?: string) {
    const occurrence = await this.occurrenceRepository.findById(id);
    if (!occurrence) {
      throw new Error('Ocorrência não encontrada');
    }

    const updated = await this.occurrenceRepository.updateStatus(id, status as any);

    await this.auditRepository.logAction({
      userId,
      action: 'update',
      entity: 'occurrence',
      entityId: id,
      changes: { status: { from: occurrence.status, to: status } },
      details: { reason: reason || 'Atualização de status' }
    });

    return updated;
  }

  // NO MÉTODO getStatistics DO OccurrenceService (linha ~116)
async getStatistics(filters?: any) {
  try {
    const stats = {
      total: 0,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byMunicipality: [] as Array<{ name: string; count: number }>,
      monthly: [] as Array<{ month: string; count: number }>
    };

    // 1. Obter contagens por status
    const statusCounts = await this.occurrenceRepository.getStatusCounts(filters);
    stats.total = statusCounts.total || 0;
    stats.byStatus = {
      aberto: statusCounts.aberto || 0,
      em_andamento: statusCounts.em_andamento || 0,
      finalizado: statusCounts.finalizado || 0,
      alerta: statusCounts.alerta || 0
    };

    // 2. Obter contagens por tipo
    const typeCounts = await this.occurrenceRepository.getTypeCounts(filters);
    stats.byType = typeCounts;

    // 3. Obter contagens por município
    const municipalityCounts = await this.occurrenceRepository.getMunicipalityCounts(filters);
    stats.byMunicipality = municipalityCounts;

    // 4. Obter estatísticas mensais (últimos 6 meses)
    const monthlyStats = await this.occurrenceRepository.getMonthlyStats(filters);
    stats.monthly = monthlyStats;

    // 5. Calcular métricas adicionais
    const summary = {
      resolutionRate: stats.total > 0 ? 
        ((stats.byStatus.finalizado || 0) / stats.total * 100).toFixed(2) : '0',
      averageResponseTime: '2.5h',
      today: await this.getTodayCount(filters)
    };

    return {
      ...stats,
      summary
    };
  } catch (error: any) {
    console.error('Erro em getStatistics:', error);
    // Retorna estatísticas vazias em caso de erro
    return {
      total: 0,
      byStatus: {
        aberto: 0,
        em_andamento: 0,
        finalizado: 0,
        alerta: 0
      },
      byType: {},
      byMunicipality: [],
      monthly: [],
      summary: {
        resolutionRate: '0',
        averageResponseTime: '0h',
        today: 0
      }
    };
  }
}

  // Método auxiliar para contar ocorrências de hoje
  private async getTodayCount(filters?: any): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayFilters = {
        ...filters,
        startDate: today,
        endDate: tomorrow
      };
      
      const statusCounts = await this.occurrenceRepository.getStatusCounts(todayFilters);
      return statusCounts.total || 0;
    } catch (error) {
      console.error('Erro ao contar ocorrências de hoje:', error);
      return 0;
    }
  }

  private validateOccurrenceData(data: any) {
    const required = ['type', 'municipality', 'address', 'occurrenceDate', 'activationDate', 'description'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new Error(`Campos obrigatórios faltando: ${missing.join(', ')}`);
    }

    const validTypes = ['acidente', 'resgate', 'incendio', 'atropelamento', 'outros'];
    if (data.type && !validTypes.includes(data.type)) {
      throw new Error(`Tipo inválido. Use: ${validTypes.join(', ')}`);
    }

    const validStatus = ['aberto', 'em_andamento', 'finalizado', 'alerta'];
    if (data.status && !validStatus.includes(data.status)) {
      throw new Error(`Status inválido. Use: ${validStatus.join(', ')}`);
    }
  }

  private getChanges(oldData: any, newData: any) {
    const changes: Record<string, { from: any; to: any }> = {};
    
    const fields = ['type', 'municipality', 'status', 'victimName', 'vehicleNumber', 'description'];
    
    fields.forEach(field => {
      if (newData[field] !== undefined && newData[field] !== oldData[field]) {
        changes[field] = {
          from: oldData[field],
          to: newData[field]
        };
      }
    });

    return changes;
  }
}