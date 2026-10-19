import { PostgresAppointmentRepository } from './PostgresAppointmentRepository';
import { PostgresTestDatabase } from './postgres/test/PostgresTestDatabase';
import { AppointmentConflictError } from '../Appointment/domain/errors/AppointmentConflictError';
import {
    Appointment,
    AppointmentLocation,
    AppointmentStatus,
} from '../Appointment/domain/Appointment';
import { PostgresUnitOfWork } from './postgres/PostgresUnitOfWork';


describe('PostgresAppointmentRepository - Integration', () => {
    const database = new PostgresTestDatabase();

    beforeAll(async () => {
        await database.start();
    });

    beforeEach(async () => {
        await database.reset();
    });

    afterAll(async () => {
        await database.stop();
    });

    it('deve salvar um appointment no PostgreSQL', async () => {
        const client = await database
            .getPostgresPool()
            .getPool()
            .connect();

        try {
            const repository = new PostgresAppointmentRepository(client);

            // Arrange
            const appointment = new Appointment(
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
                '33333333-3333-3333-3333-333333333333',
                new Date('2026-09-28T14:00:00Z'),
                new Date('2026-09-28T15:00:00Z'),
                AppointmentLocation.ONLINE,
                AppointmentStatus.AGENDADO,
            );

            // Act
            await repository.save(appointment);

            // Assert
            const result = await client.query(
                `
                    SELECT
                        id,
                        doctor_id,
                        patient_id,
                        period,
                        location,
                        status
                    FROM appointments
                    WHERE id = $1
                `,
                [appointment.id],
            );

            expect(result.rowCount).toBe(1);

            expect(result.rows[0].id).toBe(appointment.id);
            expect(result.rows[0].doctor_id).toBe(appointment.doctorId);
            expect(result.rows[0].patient_id).toBe(appointment.patientId);
            expect(result.rows[0].location).toBe(appointment.location);
            expect(result.rows[0].status).toBe(appointment.status);
        } finally {
            client.release();
        }
    });

    it('deve detectar conflito de horário do médico', async () => {
        const client = await database
            .getPostgresPool()
            .getPool()
            .connect();

        try {
            const repository = new PostgresAppointmentRepository(client);

            const appointment = new Appointment(
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
                '33333333-3333-3333-3333-333333333333',
                new Date('2026-09-29T14:00:00Z'),
                new Date('2026-09-29T15:00:00Z'),
                AppointmentLocation.ONLINE,
                AppointmentStatus.AGENDADO,
            );

            await repository.save(appointment);

            const hasConflict = await repository.hasDoctorConflict(
                appointment.doctorId,
                new Date('2026-09-29T14:30:00Z'),
                new Date('2026-09-29T15:30:00Z'),
            );

            expect(hasConflict).toBe(true);
        } finally {
            client.release();
        }
    });

    it('deve ser possível agendar um horário para o médico', async () => {
        const client = await database
            .getPostgresPool()
            .getPool()
            .connect();

        try {
            const repository = new PostgresAppointmentRepository(client);

            const appointment = new Appointment(
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
                '33333333-3333-3333-3333-333333333333',
                new Date('2026-09-29T14:00:00Z'),
                new Date('2026-09-29T15:00:00Z'),
                AppointmentLocation.ONLINE,
                AppointmentStatus.AGENDADO,
            );

            await repository.save(appointment);

            const hasConflict = await repository.hasDoctorConflict(
                appointment.doctorId,
                new Date('2026-09-29T15:00:00Z'),
                new Date('2026-09-29T16:00:00Z'),
            );

            expect(hasConflict).toBe(false);
        } finally {
            client.release();
        }
    });

    it('deve detectar conflito de horário do paciente', async () => {
        const client = await database
            .getPostgresPool()
            .getPool()
            .connect();

        try {
            const repository = new PostgresAppointmentRepository(client);

            const appointment = new Appointment(
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
                '33333333-3333-3333-3333-333333333333',
                new Date('2026-09-30T14:00:00Z'),
                new Date('2026-09-30T15:00:00Z'),
                AppointmentLocation.ONLINE,
                AppointmentStatus.AGENDADO,
            );

            await repository.save(appointment);

            const hasConflict = await repository.hasPatientConflict(
                appointment.patientId,
                new Date('2026-09-30T14:30:00Z'),
                new Date('2026-09-30T15:30:00Z'),
            );

            expect(hasConflict).toBe(true);
        } finally {
            client.release();
        }
    });

    it('deve detectar conflito de horário do paciente', async () => {
        const client = await database
            .getPostgresPool()
            .getPool()
            .connect();

        try {
            const repository = new PostgresAppointmentRepository(client);

            const appointment = new Appointment(
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
                '33333333-3333-3333-3333-333333333333',
                new Date('2026-09-30T14:00:00Z'),
                new Date('2026-09-30T15:00:00Z'),
                AppointmentLocation.ONLINE,
                AppointmentStatus.AGENDADO,
            );

            await repository.save(appointment);

            const hasConflict = await repository.hasPatientConflict(
                appointment.patientId,
                new Date('2026-09-30T14:30:00Z'),
                new Date('2026-09-30T15:30:00Z'),
            );

            expect(hasConflict).toBe(true);
        } finally {
            client.release();
        }
    });

    it('deve detectar conflito via constraint do banco de dados', async () => {
        const client = await database
            .getPostgresPool()
            .getPool()
            .connect();

        try {
            const repository = new PostgresAppointmentRepository(client);

            const appointment1 = new Appointment(
                '11111111-1111-1111-1111-111111111111',
                '22222222-2222-2222-2222-222222222222',
                '33333333-3333-3333-3333-333333333333',
                new Date('2026-09-30T14:00:00Z'),
                new Date('2026-09-30T15:00:00Z'),
                AppointmentLocation.ONLINE,
                AppointmentStatus.AGENDADO,
            );

            await repository.save(appointment1);

            const appointment2 = new Appointment(
                '44444444-4444-4444-4444-444444444444',
                '55555555-5555-5555-5555-555555555555',
                '33333333-3333-3333-3333-333333333333',
                new Date('2026-09-30T14:30:00Z'),
                new Date('2026-09-30T15:30:00Z'),
                AppointmentLocation.ONLINE,
                AppointmentStatus.AGENDADO,
            );

            await expect(repository.save(appointment2)).rejects.toThrow(AppointmentConflictError);
        } finally {
            client.release();
        }
    });

    it('deve realizar rollback quando uma operação falhar', async () => {
        const unitOfWork = new PostgresUnitOfWork(
            database.getPostgresPool(),
        );

        const appointment = new Appointment(
            '11111111-1111-1111-1111-111111111111',
            '22222222-2222-2222-2222-222222222222',
            '33333333-3333-3333-3333-333333333333',
            new Date('2026-09-30T14:00:00Z'),
            new Date('2026-09-30T15:00:00Z'),
            AppointmentLocation.ONLINE,
            AppointmentStatus.AGENDADO,
        );

        await expect(
            unitOfWork.execute(async ({ appointmentRepository }) => {
                await appointmentRepository.save(appointment);

                throw new Error('Falha simulada');
            }),
        ).rejects.toThrow('Falha simulada');

        const result = await database
            .getPostgresPool()
            .getPool()
            .query(
                'SELECT id FROM appointments WHERE id = $1',
                [appointment.id],
            );

        expect(result.rowCount).toBe(0);
    });
});