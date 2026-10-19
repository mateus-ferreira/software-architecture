import { AppointmentModule } from './Appointment/AppointmentModule';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/postgres/DatabaseModule';

@Module({
  imports: [
    AppointmentModule, 
    ConfigModule.forRoot(),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
