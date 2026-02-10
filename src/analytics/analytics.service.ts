import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(private dataSource: DataSource) { }

  async getPerformance(vehicleId: string) {
    const result = await this.dataSource.query(
      `
  SELECT
    SUM(m."kwhConsumedAc") AS total_ac,
    SUM(v."kwhDeliveredDc") AS total_dc,
    AVG(v."batteryTemp") AS avg_temp
  FROM vehicle_telemetry_history v
  JOIN meter_telemetry_history m
    ON v."timestamp" = m."timestamp"
  WHERE v."vehicleId" = $1
    AND v."timestamp" >= NOW() - INTERVAL '24 HOURS'
  `,
      [vehicleId],
    );

    const { total_ac, total_dc, avg_temp } = result[0];

    return {
      vehicleId,
      totalAc: Number(total_ac),
      totalDc: Number(total_dc),
      efficiency: total_dc / total_ac,
      avgBatteryTemp: Number(avg_temp),
    };
  }
}
