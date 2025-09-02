import { Module } from '@nestjs/common';
import { TypeLocalService } from './type_local.service';
import { TypeLocalController } from './type_local.controller';
import { Typelocal } from './entities/type_local.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Typelocal])],
  controllers: [TypeLocalController],
  providers: [TypeLocalService],
})
export class TypeLocalModule {}
