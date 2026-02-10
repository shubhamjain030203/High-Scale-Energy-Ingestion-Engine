import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';

import {
  VehicleTelemetryHistory,
} from '../entities/vehicle-history.entity';
import {
  MeterTelemetryHistory,
} from '../entities/meter-history.entity';
import {
  VehicleLiveStatus,
} from '../entities/vehicle-live.entity';
import {
  MeterLiveStatus,
} from '../entities/meter-live.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VehicleTelemetryHistory,
      MeterTelemetryHistory,
      VehicleLiveStatus,
      MeterLiveStatus,
    ]),
  ],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}
