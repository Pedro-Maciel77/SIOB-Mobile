"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleRepository = void 0;
const Vehicle_1 = require("../entities/Vehicle");
const BaseRepository_1 = require("./BaseRepository");
class VehicleRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(Vehicle_1.Vehicle);
    }
    async findByPlate(plate) {
        return await this.repository.findOne({
            where: { plate }
        });
    }
    async findActiveVehicles() {
        return await this.repository.find({
            where: { active: true },
            order: { name: 'ASC' }
        });
    }
    async getVehicleStats(vehicleId) {
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
        }, {});
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
exports.VehicleRepository = VehicleRepository;
