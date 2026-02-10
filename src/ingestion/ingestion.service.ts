import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VehicleTelemetryHistory } from '../entities/vehicle-history.entity';
import { MeterTelemetryHistory } from '../entities/meter-history.entity';
import { VehicleLiveStatus } from '../entities/vehicle-live.entity';
import { MeterLiveStatus } from '../entities/meter-live.entity';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(VehicleTelemetryHistory)
    private vehicleHistoryRepo: Repository<VehicleTelemetryHistory>,

    @InjectRepository(MeterTelemetryHistory)
    private meterHistoryRepo: Repository<MeterTelemetryHistory>,

    @InjectRepository(VehicleLiveStatus)
    private vehicleLiveRepo: Repository<VehicleLiveStatus>,

    @InjectRepository(MeterLiveStatus)
    private meterLiveRepo: Repository<MeterLiveStatus>,
  ) {}

  async ingestVehicle(data: any) {
    await this.vehicleHistoryRepo.save({
      ...data,
      timestamp: new Date(data.timestamp),
    });

    await this.vehicleLiveRepo.save({
      vehicleId: data.vehicleId,
      soc: data.soc,
      kwhDeliveredDc: data.kwhDeliveredDc,
      batteryTemp: data.batteryTemp,
      lastUpdated: new Date(),
    });

    return { status: 'vehicle telemetry ingested' };
  }

  async ingestMeter(data: any) {
    await this.meterHistoryRepo.save({
      ...data,
      timestamp: new Date(data.timestamp),
    });

    await this.meterLiveRepo.save({
      meterId: data.meterId,
      kwhConsumedAc: data.kwhConsumedAc,
      voltage: data.voltage,
      lastUpdated: new Date(),
    });

    return { status: 'meter telemetry ingested' };
  }
}
