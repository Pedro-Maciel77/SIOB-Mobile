"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Occurrence = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Vehicle_1 = require("./Vehicle");
const Report_1 = require("./Report");
const OccurrenceImage_1 = require("./OccurrenceImage");
let Occurrence = class Occurrence {
    id; // Adicionado "!" para indicar inicialização definida
    type;
    municipality;
    neighborhood;
    address;
    latitude;
    longitude;
    occurrenceDate;
    activationDate;
    status;
    victimName;
    victimContact;
    vehicle;
    vehicleNumber;
    description;
    createdBy;
    reports;
    images;
    createdAt;
    updatedAt;
    // Construtor para inicializar arrays
    constructor() {
        this.reports = [];
        this.images = [];
    }
};
exports.Occurrence = Occurrence;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Occurrence.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50
    }),
    __metadata("design:type", String)
], Occurrence.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Occurrence.prototype, "municipality", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Occurrence.prototype, "neighborhood", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Occurrence.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Occurrence.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Occurrence.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Occurrence.prototype, "occurrenceDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Occurrence.prototype, "activationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: 'aberto'
    }),
    __metadata("design:type", String)
], Occurrence.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Occurrence.prototype, "victimName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Occurrence.prototype, "victimContact", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vehicle_1.Vehicle, vehicle => vehicle.occurrences, { nullable: true }),
    __metadata("design:type", Vehicle_1.Vehicle)
], Occurrence.prototype, "vehicle", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Occurrence.prototype, "vehicleNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Occurrence.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.occurrences),
    __metadata("design:type", User_1.User)
], Occurrence.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Report_1.Report, report => report.occurrence),
    __metadata("design:type", Array)
], Occurrence.prototype, "reports", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OccurrenceImage_1.OccurrenceImage, image => image.occurrence),
    __metadata("design:type", Array)
], Occurrence.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Occurrence.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Occurrence.prototype, "updatedAt", void 0);
exports.Occurrence = Occurrence = __decorate([
    (0, typeorm_1.Entity)('occurrences'),
    __metadata("design:paramtypes", [])
], Occurrence);
