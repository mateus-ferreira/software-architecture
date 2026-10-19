export class AppointmentConflictError extends Error {
    constructor() {
        super('Appointment has a conflicting schedule');
        this.name = 'AppointmentConflictError';
    }
}