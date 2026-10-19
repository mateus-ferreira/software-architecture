import { Appointment, AppointmentLocation, AppointmentStatus } from "../domain/Appointment";
import { AppointmentRepository } from "../domain/AppointmentRepository";
import { DoctorRepository } from "../domain/DoctorRepository";
import { PatientRepository } from "../domain/PatientRepository";
import { DoctorNotFoundError } from "../domain/errors/DoctorNotFoundError";
import { PatientNotFoundError } from "../domain/errors/PatientNotFoundError";
import { InvalidAppointmentDatesError } from "../domain/errors/InvalidAppointmentDatesError";
import { AppointmentConflictError } from "../domain/errors/AppointmentConflictError";
import { CreateAppointment } from "./CreateAppointment";
import { UnitOfWork } from "./UnitOfWork";

class FakeDoctorRepository implements DoctorRepository {
    constructor(private readonly doctorExists: boolean) { }

    async exists(doctorId: string): Promise<boolean> {
        return this.doctorExists;
    }
}

class FakePatientRepository implements PatientRepository {
    constructor(private readonly patientExists: boolean) { }

    async exists(patientId: string): Promise<boolean> {
        return this.patientExists;
    }
}

class FakeAppointmentRepository implements AppointmentRepository {
    saveCalled = false;

    savedAppointment: Appointment | null = null;

    constructor(
        private readonly doctorConflict: boolean = false,
        private readonly patientConflict: boolean = false
    ) { }

    async hasDoctorConflict(
        doctorId: string,
        startAt: Date,
        endAt: Date,
    ): Promise<boolean> {
        return this.doctorConflict;
    }

    async hasPatientConflict(
        patientId: string,
        startAt: Date,
        endAt: Date,
    ): Promise<boolean> {
        return this.patientConflict;
    }

    async save(appointment: Appointment): Promise<void> {
        this.saveCalled = true;
        this.savedAppointment = appointment;
    }

}

class FakeUnitOfWork implements UnitOfWork {
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
    ) {}

    async execute<T>(
        work: (repositories: {
            appointmentRepository: AppointmentRepository;
        }) => Promise<T>,
    ): Promise<T> {
        return work({
            appointmentRepository: this.appointmentRepository,
        });
    }
}

describe('CreateAppointment', () => {
    it('deve impedir criação quando o médico não existe', async () => {
        // Arrange
        const appointmentRepository = new FakeAppointmentRepository();
        const unitOfWork = new FakeUnitOfWork(appointmentRepository);
        const doctorRepository = new FakeDoctorRepository(false);
        const patientRepository = new FakePatientRepository(true);

        const createAppointment = new CreateAppointment(
            unitOfWork,
            doctorRepository,
            patientRepository
);

        // Act + Assert
        await expect(
            createAppointment.execute(
                'doctor-1',
                'patient-1',
                new Date('2026-08-20T10:00:00'),
                new Date('2026-08-20T11:00:00'),
                AppointmentLocation.ONLINE
            )
        ).rejects.toThrow(DoctorNotFoundError);

        expect(appointmentRepository.saveCalled).toBe(false);
    });

    it('deve impedir criação quando o paciente não existe', async () => {
        // Arrange
        const appointmentRepository = new FakeAppointmentRepository();
        const doctorRepository = new FakeDoctorRepository(true);
        const patientRepository = new FakePatientRepository(false);

        const unitOfWork = new FakeUnitOfWork(appointmentRepository);

        const createAppointment = new CreateAppointment(
            unitOfWork,
            doctorRepository,
            patientRepository
        );

        // Act + Assert
        await expect(
            createAppointment.execute(
                'doctor-1',
                'patient-1',
                new Date('2026-08-20T10:00:00'),
                new Date('2026-08-20T11:00:00'),
                AppointmentLocation.ONLINE
            )
        ).rejects.toThrow(PatientNotFoundError);

        expect(appointmentRepository.saveCalled).toBe(false);
    });

    it('deve criar um agendamento quando o médico e o paciente existem', async () => {
        // Arrange
        const appointmentRepository = new FakeAppointmentRepository();
        const doctorRepository = new FakeDoctorRepository(true);
        const patientRepository = new FakePatientRepository(true);

        const unitOfWork = new FakeUnitOfWork(appointmentRepository);

        const createAppointment = new CreateAppointment(
            unitOfWork,
            doctorRepository,
            patientRepository
        );

        // Act
        await createAppointment.execute(
            'doctor-1',
            'patient-1',
            new Date('2026-08-20T10:00:00'),
            new Date('2026-08-20T11:00:00'),
            AppointmentLocation.ONLINE
        );

        // Assert
        expect(appointmentRepository.saveCalled).toBe(true);
        expect(appointmentRepository.savedAppointment).not.toBeNull();
        expect(appointmentRepository.savedAppointment?.startAt)
            .toEqual(new Date('2026-08-20T10:00:00'));

        expect(appointmentRepository.savedAppointment?.endAt)
            .toEqual(new Date('2026-08-20T11:00:00'));

        expect(appointmentRepository.savedAppointment?.location)
            .toBe(AppointmentLocation.ONLINE);

        expect(appointmentRepository.savedAppointment?.status)
            .toBe(AppointmentStatus.AGENDADO);
    });

    it('deve impedir criação quando há conflito de horário para o médico', async () => {
        const appointmentRepository = new FakeAppointmentRepository(true);
        const doctorRepository = new FakeDoctorRepository(true);
        const patientRepository = new FakePatientRepository(true);

        const unitOfWork = new FakeUnitOfWork(appointmentRepository);

        const createAppointment = new CreateAppointment(
            unitOfWork,
            doctorRepository,
            patientRepository
        );

        // Act + Assert
        await expect(
            createAppointment.execute(
                'doctor-1',
                'patient-1',
                new Date('2026-08-20T10:00:00'),
                new Date('2026-08-20T11:00:00'),
                AppointmentLocation.ONLINE
            )
        ).rejects.toThrow(AppointmentConflictError);

        expect(appointmentRepository.saveCalled).toBe(false);
    });

    it('deve impedir criação quando há conflito de horário para o paciente', async () => {
        // Arrange
        const appointmentRepository = new FakeAppointmentRepository(false, true);
        const doctorRepository = new FakeDoctorRepository(true);
        const patientRepository = new FakePatientRepository(true);

        const unitOfWork = new FakeUnitOfWork(appointmentRepository);

        const createAppointment = new CreateAppointment(
            unitOfWork,
            doctorRepository,
            patientRepository
        );

        // Act + Assert
        await expect(
            createAppointment.execute(
                'doctor-1',
                'patient-1',
                new Date('2026-08-20T10:00:00'),
                new Date('2026-08-20T11:00:00'),
                AppointmentLocation.ONLINE
            )
        ).rejects.toThrow(AppointmentConflictError);

        expect(appointmentRepository.saveCalled).toBe(false);
    });
});