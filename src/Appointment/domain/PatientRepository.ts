export interface PatientRepository {
    exists(patientId: string): Promise<boolean>;
}