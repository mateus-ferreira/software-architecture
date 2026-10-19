import { Inject } from "@nestjs/common";
import { randomUUID } from "crypto";

import { Appointment, AppointmentLocation, AppointmentStatus } from "../domain/Appointment";
import type { DoctorRepository } from "../domain/DoctorRepository";
import type { PatientRepository } from "../domain/PatientRepository";
import type { UnitOfWork } from "./UnitOfWork";

import { DoctorNotFoundError } from "../domain/errors/DoctorNotFoundError";
import { PatientNotFoundError } from "../domain/errors/PatientNotFoundError";
import { AppointmentConflictError } from "../domain/errors/AppointmentConflictError";

export class CreateAppointment {
    constructor(
        @Inject('UnitOfWork')
        private readonly unitOfWork: UnitOfWork,

        @Inject('DoctorRepository')
        private readonly doctorRepository: DoctorRepository,

        @Inject('PatientRepository')
        private readonly patientRepository: PatientRepository,
    ) { }

    async execute(
        doctorId: string,
        patientId: string,
        startAt: Date,
        endAt: Date,
        location: AppointmentLocation,
    ): Promise<Appointment> {

        if (!(await this.doctorRepository.exists(doctorId))) {
            throw new DoctorNotFoundError();
        }

        if (!(await this.patientRepository.exists(patientId))) {
            throw new PatientNotFoundError();
        }

        const generatedId = randomUUID();

        const appointment = new Appointment(
            generatedId,
            patientId,
            doctorId,
            startAt,
            endAt,
            location,
            AppointmentStatus.AGENDADO,
        );

        await this.unitOfWork.execute(async ({ appointmentRepository }) => {

            if (
                await appointmentRepository.hasDoctorConflict(
                    doctorId,
                    startAt,
                    endAt,
                )
            ) {
                throw new AppointmentConflictError();
            }

            if (
                await appointmentRepository.hasPatientConflict(
                    patientId,
                    startAt,
                    endAt,
                )
            ) {
                throw new AppointmentConflictError();
            }

            await appointmentRepository.save(appointment);
        });

        return appointment;
    }
}