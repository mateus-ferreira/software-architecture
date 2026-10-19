import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { AppointmentConflictError } from '../../domain/errors/AppointmentConflictError';

@Catch(AppointmentConflictError)
export class AppointmentConflictFilter implements ExceptionFilter {
    catch(exception: AppointmentConflictError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = 409;

        response.status(status).json({
            statusCode: status,
            message: exception.message,
        });
    }
}