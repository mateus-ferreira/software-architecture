import { Body, Controller, Post, UseFilters } from "@nestjs/common";
import { CreateAppointment } from "./CreateAppointment";
import { CreateAppointmentDto } from "./dto/CreateAppointmentDto";
import { CreateAppointmentResponseDto } from "./dto/CreateAppointmentResponseDto";
import { DomainExceptionFilter } from "./filters/DomainExceptionFilter";

@Controller('appointments')
@UseFilters(DomainExceptionFilter)
export class AppointmentController {
    constructor(
        private readonly createAppointment: CreateAppointment,
    ) {}
    
    @Post('/')
    async appointmentCreation(@Body() data: CreateAppointmentDto): Promise<CreateAppointmentResponseDto> {
        const appointment = await this.createAppointment.execute(
            data.doctorId,
            data.patientId,
            new Date(data.startAt),
            new Date(data.endAt),
            data.location,
        );

        return {
            id: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            startAt: appointment.startAt,
            endAt: appointment.endAt,
            location: appointment.location,
            status: appointment.status,
        };
    }
}