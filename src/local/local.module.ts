import { Module } from '@nestjs/common';
import { LocalService } from './local.service';
import { LocalController } from './local.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Local } from './entities/local.entity';
import { Zone } from 'src/zone/entities/zone.entity';
import { Typelocal } from 'src/type_local/entities/type_locale.entity';
import { HttpModule } from '@nestjs/axios';
import { EventsModule } from 'src/events/events.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [TypeOrmModule.forFeature([Local, Zone, Typelocal]),
  HttpModule.register({ timeout: 5000, maxRedirects: 5 }),
    EventsModule],
  controllers: [LocalController],
  providers: [LocalService],
})
export class LocalModule { }
