import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('vehicle_live_status')
export class VehicleLiveStatus {
    @PrimaryColumn()
    vehicleId: string;

    @Column('float')
    soc: number;

    @Column('float')
    kwhDeliveredDc: number;

    @Column('float')
    batteryTemp: number;

    @Column()
    lastUpdated: Date;
}
