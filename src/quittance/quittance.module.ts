import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuittanceService } from './quittance.service';
import { QuittanceController } from './quittance.controller';
import { Quittance } from 'src/modele_cible/entities/quittance.entity';
import { Paiement } from 'src/paiement/entities/paiement.entity';
import { AuditLog } from 'src/modele_cible/entities/audit_log.entity';
import { Redevance } from 'src/modele_cible/entities/redevance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quittance, Paiement, AuditLog, Redevance])],
  controllers: [QuittanceController],
  providers: [QuittanceService],
  exports: [QuittanceService],
})
export class QuittanceModule {}
