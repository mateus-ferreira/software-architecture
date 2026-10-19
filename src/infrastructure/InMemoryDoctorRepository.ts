import { DoctorRepository } from "../Appointment/domain/DoctorRepository";

export class InMemoryDoctorRepository implements DoctorRepository {
    async exists(doctorId: string): Promise<boolean> {
        return true;
    }
}