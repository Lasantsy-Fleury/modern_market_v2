import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PerceptionService } from './perception.service';
import { CreerPaiementDto, UpdatePaiementDto } from './dto/creer-paiement.dto';
import { CreerEcheanceDto } from './dto/creer-echeance.dto';
import { CreerModePaiementDto } from './dto/mode-paiement.dto';

const PIPES = new ValidationPipe({ transform: true, whitelist: true });

@ApiTags('Cycle de perception')
@Controller('perception')
export class PerceptionController {
  constructor(private readonly perceptionService: PerceptionService) {}

  @Post('paiements')
  @UsePipes(PIPES)
  @ApiOperation({
    summary: 'Enregistrer un paiement pour une obligation (redevance)',
    description: 'Crée paiement + imputation + recette + quittance, met à jour la redevance.',
  })
  enregistrerPaiement(@Body() dto: CreerPaiementDto) {
    return this.perceptionService.enregistrerPaiement(dto);
  }

  @Get('paiements/:id')
  @ApiOperation({ summary: 'Consulter un paiement' })
  findOnePaiement(@Param('id', ParseUUIDPipe) id: string) {
    return this.perceptionService.findOnePaiement(id);
  }

  @Patch('paiements/:id')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Modifier (protégé : paiement validé immuable, raison/failed uniquement)' })
  updatePaiement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaiementDto,
  ) {
    return this.perceptionService.updatePaiement(id, dto);
  }

  @Get('commercants/:id/paiements')
  @ApiOperation({ summary: 'Paiements d\'un commerçant' })
  findPaiementsCommercant(@Param('id', ParseUUIDPipe) id: string) {
    return this.perceptionService.findPaiementsCommercant(id);
  }

  @Get('commercants/:id/situation')
  @ApiOperation({ summary: 'Situation financière centralisée du commerçant' })
  getSituationCommercant(@Param('id', ParseUUIDPipe) id: string) {
    return this.perceptionService.getSituationCommercant(id);
  }

  @Post('echeances')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Créer une échéance' })
  createEcheance(@Body() dto: CreerEcheanceDto) {
    return this.perceptionService.createEcheance(dto);
  }

  @Get('echeances')
  @ApiOperation({ summary: 'Lister les échéances' })
  findAllEcheances() {
    return this.perceptionService.findAllEcheances();
  }

  @Post('mode-paiements')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Déclarer un mode de paiement (espèces, Mobile Money, autres)' })
  createModePaiement(@Body() dto: CreerModePaiementDto) {
    return this.perceptionService.createModePaiement(dto);
  }

  @Get('mode-paiements')
  @ApiOperation({ summary: 'Lister les modes de paiement' })
  findAllModePaiements() {
    return this.perceptionService.findAllModePaiements();
  }
}
