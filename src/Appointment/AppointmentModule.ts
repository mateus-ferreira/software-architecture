import { Module } from '@nestjs/common';
import { InMemoryAppointmentRepository } from '../infrastructure/InMemoryAppointmentRepository';
import { InMemoryPatientRepository } from '../infrastructure/InMemoryPatientRepository';
import { InMemoryDoctorRepository } from '../infrastructure/InMemoryDoctorRepository';
import { CreateAppointment } from './application/CreateAppointment';
import { AppointmentController } from './application/AppointmentController';
import { DatabaseModule } from '../infrastructure/postgres/DatabaseModule';
import { PostgresUnitOfWork } from '../infrastructure/postgres/PostgresUnitOfWork';

@Module({
    imports: [DatabaseModule],
    controllers: [AppointmentController],
    providers: [
        {
            provide: "UnitOfWork",
            useClass: PostgresUnitOfWork,
        },
        {
            provide: 'DoctorRepository',
            useClass: InMemoryDoctorRepository,
        },
        {
            provide: 'PatientRepository',
            useClass: InMemoryPatientRepository,
        },
        CreateAppointment,
    ],
})
export class AppointmentModule {}