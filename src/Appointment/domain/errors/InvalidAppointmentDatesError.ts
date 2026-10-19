export class InvalidAppointmentDatesError extends Error {
    constructor() {
        super('Invalid appointment dates');
        this.name = 'InvalidAppointmentDatesError';
    }
}