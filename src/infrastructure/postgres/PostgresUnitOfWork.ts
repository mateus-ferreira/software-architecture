import { PoolClient } from "pg";
import { Injectable } from "@nestjs/common";
import { UnitOfWork } from "../../Appointment/application/UnitOfWork";
import { AppointmentRepository } from "../../Appointment/domain/AppointmentRepository";
import { PostgresAppointmentRepository } from "../PostgresAppointmentRepository";
import { PostgresPool } from "./PostgresPool";

@Injectable()
export class PostgresUnitOfWork implements UnitOfWork {

    constructor(
        private readonly postgresPool: PostgresPool,
    ) {}

    async execute<T>(
        work: (repositories: {
            appointmentRepository: AppointmentRepository;
        }) => Promise<T>,
    ): Promise<T> {

        const client: PoolClient =
            await this.postgresPool.getPool().connect();

        try {
            await client.query("BEGIN");

            const appointmentRepository =
                new PostgresAppointmentRepository(client);

            const result = await work({
                appointmentRepository,
            });

            await client.query("COMMIT");

            return result;

        } catch (error) {

            await client.query("ROLLBACK");

            throw error;

        } finally {

            client.release();
        }
    }
}