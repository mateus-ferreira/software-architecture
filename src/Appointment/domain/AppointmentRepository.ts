import { Appointment } from './Appointment';

export interface AppointmentRepository {
    hasDoctorConflict(doctorId: string, startAt: Date, endAt: Date): Promise<boolean>;
    hasPatientConflict(patientId: string, startAt: Date, endAt: Date): Promise<boolean>;
    save(appointment: Appointment): Promise<void>;
}