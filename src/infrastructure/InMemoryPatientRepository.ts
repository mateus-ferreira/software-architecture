import { PatientRepository } from "../Appointment/domain/PatientRepository";

export class InMemoryPatientRepository implements PatientRepository {
    async exists(patientId: string): Promise<boolean> {
        return true;
    }
}