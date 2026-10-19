import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { DoctorNotFoundError } from '../../domain/errors/DoctorNotFoundError';
import { PatientNotFoundError } from '../../domain/errors/PatientNotFoundError';
import { AppointmentConflictError } from '../../domain/errors/AppointmentConflictError';
import { InvalidAppointmentDatesError } from '../../domain/errors/InvalidAppointmentDatesError';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        let status: number = 500;

        if (exception instanceof DoctorNotFoundError) {
            status = 404;
        } else if (exception instanceof PatientNotFoundError) {
            status = 404;
        } else if (exception instanceof AppointmentConflictError) {
            status = 409;
        }
        else if (exception instanceof InvalidAppointmentDatesError) {
            status = 400;
        }   

        response.status(status).json({
            statusCode: status,
            message: (exception as Error).message,
        });
    }
}