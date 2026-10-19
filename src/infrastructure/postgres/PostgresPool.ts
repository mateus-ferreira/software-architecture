import { Injectable, Inject, BeforeApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';

import type { PostgresConfig } from './PostgresConfig';

@Injectable()
export class PostgresPool implements BeforeApplicationShutdown {

    private readonly pool: Pool;

    constructor(
        @Inject('PostgresConfig')
        config: PostgresConfig,
    ) {
        this.pool = new Pool(config);
    }

    getPool(): Pool {
        return this.pool;
    }

    async beforeApplicationShutdown() {
        await this.pool.end();
    }
}