import { AppointmentRepository } from '../domain/AppointmentRepository';

export interface UnitOfWork {
    execute<T>(
        work: (repositories: {
            appointmentRepository: AppointmentRepository;
        }) => Promise<T>,
    ): Promise<T>;
}