import { Module } from '@nestjs/common';
import { TarifService } from './tarif.service';
import { TarifController } from './tarif.controller';
import { Tarif } from './entities/tarif.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports:[TypeOrmModule.forFeature([Tarif]),
  
  ],
  controllers: [TarifController],
  providers: [TarifService],
})
export class TarifModule {}
