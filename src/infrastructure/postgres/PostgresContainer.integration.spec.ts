import { PostgresTestDatabase } from './test/PostgresTestDatabase';

describe('PostgreSQL - Integration', () => {
    const database = new PostgresTestDatabase();

    beforeAll(async () => {
        await database.start();
    });

    beforeEach(async () => {
        await database.reset();
    });

    afterAll(async () => {
        await database.stop();
    });

    it('deve criar a tabela appointments', async () => {
        const result = await database.getPostgresPool().getPool()
            .query(`
                SELECT to_regclass('public.appointments') AS table_name
            `);

        expect(result.rows[0].table_name).toBe('appointments');
    });
});