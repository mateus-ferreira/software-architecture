import { AppointmentLocation, AppointmentStatus } from "../../domain/Appointment";

export class CreateAppointmentResponseDto {
    id!: string;
    patientId!: string;
    doctorId!: string;
    startAt!: Date;
    endAt!: Date;
    location!: AppointmentLocation;
    status!: AppointmentStatus;
}