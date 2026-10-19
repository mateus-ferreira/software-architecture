export interface DoctorRepository {
    exists(doctorId: string): Promise<boolean>;
}