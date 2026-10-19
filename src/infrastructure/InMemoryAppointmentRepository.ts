import { Appointment } from '../Appointment/domain/Appointment';
import { AppointmentRepository } from '../Appointment/domain/AppointmentRepository';

export class InMemoryAppointmentRepository implements AppointmentRepository {
    private appointments: Appointment[] = [];

    async hasDoctorConflict(doctorId: string, startAt: Date, endAt: Date): Promise<boolean> {
        return this.appointments.some(appointment =>
            appointment.doctorId === doctorId &&
            startAt < appointment.endAt &&
            endAt > appointment.startAt
        );
    }

    async hasPatientConflict(patientId: string, startAt: Date, endAt: Date): Promise<boolean> {
        return this.appointments.some(appointment =>
            appointment.patientId === patientId &&
            startAt < appointment.endAt &&
            endAt > appointment.startAt
        );
    }

    async save(appointment: Appointment): Promise<void> {        
        this.appointments.push(appointment);
    }
}