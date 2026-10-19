import { Appointment } from "../Appointment/domain/Appointment";
import { AppointmentRepository } from "../Appointment/domain/AppointmentRepository";
import { AppointmentConflictError } from "../Appointment/domain/errors/AppointmentConflictError";
import { DatabaseError } from "pg";
import { PoolClient } from "pg";

export class PostgresAppointmentRepository implements AppointmentRepository {
    constructor(
        private readonly client: PoolClient,
    ) { }

    async hasDoctorConflict(doctorId: string, startAt: Date, endAt: Date): Promise<boolean> {

        const result = await this.client.query(`SELECT * FROM appointments WHERE doctor_id = $1 AND period && tstzrange($2, $3, '[)')`, [
            doctorId,
            startAt,
            endAt
        ]);

        return (result.rowCount ?? 0) > 0;

    }

    async hasPatientConflict(patientId: string, startAt: Date, endAt: Date): Promise<boolean> {

        const result = await this.client.query(`SELECT * FROM appointments WHERE patient_id = $1 AND period && tstzrange($2, $3, '[)')`, [
            patientId,
            startAt,
            endAt
        ]);

        return (result.rowCount ?? 0) > 0;

    }

    async save(appointment: Appointment): Promise<void> {

        try {

            await this.client.query(`INSERT INTO appointments (id, doctor_id, patient_id, period, location, status) VALUES ($1, $2, $3, tstzrange($4, $5, '[)'), $6, $7)`, [
                appointment.id,
                appointment.doctorId,
                appointment.patientId,
                appointment.startAt,
                appointment.endAt,
                appointment.location,
                appointment.status
            ]);

        } catch (error) {
            if (error instanceof DatabaseError) {
                if (error.constraint === 'appointments_doctor_date' || error.constraint === 'appointments_patient_date') {
                    throw new AppointmentConflictError();
                }
            }

            throw error;
        }
    }
}