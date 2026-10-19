import { InvalidAppointmentDatesError } from './errors/InvalidAppointmentDatesError';

export enum AppointmentLocation {
	PRESENCIAL = 'PRESENCIAL',
	ONLINE = 'ONLINE',
}

export enum AppointmentStatus {
	CONFIRMADO = 'CONFIRMADO',
	CANCELADO = 'CANCELADO',
	AGENDADO = 'AGENDADO',
}

export class Appointment {
	constructor(
		public id: string, //uuid
		public patientId: string, //uuid
		public doctorId: string, //uuid
		public startAt: Date,
		public endAt: Date,
		public location: AppointmentLocation,
		public status: AppointmentStatus
	) {
		this.validateDates(startAt, endAt);
	}

	validateDates(startAt: Date, endAt: Date): void {
		if (endAt <= startAt) {
			throw new InvalidAppointmentDatesError();
		}
	}
}