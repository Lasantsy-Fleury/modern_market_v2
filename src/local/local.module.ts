import { Module } from '@nestjs/common';
import { LocalService } from './local.service';
import { LocalController } from './local.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Local } from './entities/local.entity';
import { Zone } from 'src/zone/entities/zone.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Local,Zone])],
  controllers: [LocalController],
  providers: [LocalService],
})
export class LocalModule {}
