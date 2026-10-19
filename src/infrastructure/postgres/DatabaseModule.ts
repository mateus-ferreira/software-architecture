import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PostgresPool } from './PostgresPool';
import { PostgresConfig } from './PostgresConfig';

@Module({
    imports: [ConfigModule],

    providers: [
        {
            provide: 'PostgresConfig',
            inject: [ConfigService],
            useFactory: (configService: ConfigService): PostgresConfig => ({
                user: configService.getOrThrow<string>('POSTGRES_USER'),
                password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
                host: configService.getOrThrow<string>('POSTGRES_HOST'),
                port: Number(
                    configService.getOrThrow<string>('POSTGRES_PORT')
                ),
                database: configService.getOrThrow<string>('POSTGRES_DB_NAME'),
            }),
        },

        PostgresPool,
    ],

    exports: [PostgresPool],
})
export class DatabaseModule {}