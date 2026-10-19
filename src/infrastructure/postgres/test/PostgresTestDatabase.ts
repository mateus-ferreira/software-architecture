import { readFile } from 'fs/promises';
import { join } from 'path';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { PostgresPool } from '../PostgresPool';
import type { PostgresConfig } from '../PostgresConfig';

export class PostgresTestDatabase {

    private container!: Awaited<
        ReturnType<PostgreSqlContainer['start']>
    >;

    private postgresPool!: PostgresPool;

    async start(): Promise<void> {
        this.container = await new PostgreSqlContainer('postgres:18')
            .start();

        const config: PostgresConfig = {
            host: this.container.getHost(),
            port: this.container.getPort(),
            user: this.container.getUsername(),
            password: this.container.getPassword(),
            database: this.container.getDatabase(),
        };

        this.postgresPool = new PostgresPool(config);

        await this.runMigrations();
    }

    getPostgresPool(): PostgresPool {
        return this.postgresPool;
    }

    async stop(): Promise<void> {
        await this.postgresPool.beforeApplicationShutdown();
        await this.container.stop();
    }

    private async runMigrations(): Promise<void> {
        const client = await this.postgresPool
            .getPool()
            .connect();

        try {
            const migrationPath = join(
                __dirname,
                '../migrations/001_create_appointments.sql',
            );

            const migration = await readFile(migrationPath, 'utf-8');

            await client.query(migration);
        } finally {
            client.release();
        }
    }

    async reset(): Promise<void> {
        const client = await this.postgresPool
            .getPool()
            .connect();

        try {
            await client.query('TRUNCATE TABLE appointments');
        } finally {
            client.release();
        }
    }
}