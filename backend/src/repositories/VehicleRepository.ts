import { AppDataSource } from '../config/database';
import { Vehicle } from '../entities/Vehicle';
import { BaseRepository } from './BaseRepository';

export class VehicleRepository extends BaseRepository<Vehicle> {
  constructor() {
    super(Vehicle);
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    return await this.repository.findOne({
      where: { plate }
    });
  }

  async findActiveVehicles(): Promise<Vehicle[]> {
    return await this.repository.find({
      where: { active: true },
      order: { name: 'ASC' }
    });
  }

  async getVehicleStats(vehicleId: string): Promise<{
    totalOccurrences: number;
    lastOccurrence: Date | null;
    occurrencesByType: Record<string, number>;
  }> {
    const vehicle = await this.repository.findOne({
      where: { id: vehicleId },
      relations: ['occurrences']
    });

    if (!vehicle || !vehicle.occurrences) {
      return {
        totalOccurrences: 0,
        lastOccurrence: null,
        occurrencesByType: {}
      };
    }

    const occurrencesByType = vehicle.occurrences.reduce((acc, occurrence) => {
      acc[occurrence.type] = (acc[occurrence.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lastOccurrence = vehicle.occurrences.length > 0
      ? new Date(Math.max(...vehicle.occurrences.map(o => new Date(o.occurrenceDate).getTime())))
      : null;

    return {
      totalOccurrences: vehicle.occurrences.length,
      lastOccurrence,
      occurrencesByType
    };
  }
}