import { AppointmentLocation } from "../../domain/Appointment";
import { IsEnum, IsISO8601, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
    @IsUUID()
    doctorId!: string;

    @IsUUID()
    patientId!: string;

    @IsISO8601()
    startAt!: string;

    @IsISO8601()
    endAt!: string;

    @IsEnum(AppointmentLocation)
    location!: AppointmentLocation;
}