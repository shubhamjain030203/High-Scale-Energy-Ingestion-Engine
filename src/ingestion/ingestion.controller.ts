import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller()
export class IngestionController {
  constructor(private readonly service: IngestionService) {}

  @Post('/v1/ingest')
  ingest(@Body() body: any) {
    if (body.vehicleId) {
      return this.service.ingestVehicle(body);
    }

    if (body.meterId) {
      return this.service.ingestMeter(body);
    }

    throw new BadRequestException('Unknown telemetry type');
  }
}
