import { Module } from '@nestjs/common';
import { TypeLocalService } from './type_local.service';
import { TypeLocalController } from './type_local.controller';

@Module({
  controllers: [TypeLocalController],
  providers: [TypeLocalService],
})
export class TypeLocalModule {}
