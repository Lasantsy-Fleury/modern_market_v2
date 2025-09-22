import { Module } from '@nestjs/common';
import { TypeLocalService } from './type_locale.service';
import { TypeLocalController } from './type_locale.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Typelocal } from './entities/type_locale.entity';
import { EventsModule } from 'src/events/events.module';
@Module({
  imports: [TypeOrmModule.forFeature([Typelocal]),
    EventsModule],
  controllers: [TypeLocalController],
  providers: [TypeLocalService],
})
export class TypeLocalModule { }
