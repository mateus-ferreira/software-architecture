import { Appointment, AppointmentStatus, AppointmentLocation } from './Appointment';
import { InvalidAppointmentDatesError } from './errors/InvalidAppointmentDatesError';

describe('Appointment', () => {

    it('deve criar um appointment quando a data final é posterior à inicial', () => {
        const id = 'appointment-1';
        const patientId = 'patient-1';
        const doctorId = 'doctor-1';

        const startAt = new Date('2026-09-17T14:00:00');
        const endAt = new Date('2026-09-17T15:00:00');

        const location = AppointmentLocation.ONLINE;
        const status = AppointmentStatus.AGENDADO;

        const appointment = new Appointment(
            id,
            patientId,
            doctorId,
            startAt,
            endAt,
            location,
            status,
        );

        expect(appointment.id).toBe(id);
        expect(appointment.patientId).toBe(patientId);
        expect(appointment.doctorId).toBe(doctorId);
        expect(appointment.startAt).toEqual(startAt);
        expect(appointment.endAt).toEqual(endAt);
        expect(appointment.location).toBe(location);
        expect(appointment.status).toBe(status);
    });

    it('deve impedir a criação quando as datas de início e fim são iguais', () => {
        const id = 'appointment-1';
        const patientId = 'patient-1';
        const doctorId = 'doctor-1';

        const startAt = new Date('2026-09-17T14:00:00');
        const endAt = new Date('2026-09-17T14:00:00');

        const location = AppointmentLocation.ONLINE;
        const status = AppointmentStatus.AGENDADO;
        
        expect(
            () => new Appointment(
                id,
                patientId,
                doctorId,
                startAt,
                endAt,
                location,
                status,
            )
        ).toThrow(InvalidAppointmentDatesError);
    });

    it('deve impedir a criação quando a data final é anterior à inicial', () => {
        const id = 'appointment-1';
        const patientId = 'patient-1';
        const doctorId = 'doctor-1';

        const startAt = new Date('2026-09-17T14:00:00');
        const endAt = new Date('2026-09-17T13:00:00');

        const location = AppointmentLocation.ONLINE;
        const status = AppointmentStatus.AGENDADO;

        expect(
            () => new Appointment(
                id,
                patientId,
                doctorId,
                startAt,
                endAt,
                location,
                status,
            )
        ).toThrow(InvalidAppointmentDatesError);
    });
});