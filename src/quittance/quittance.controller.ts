import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { QuittanceService } from './quittance.service';

const PIPES = new ValidationPipe({ transform: true, whitelist: true });

@ApiTags('Quittances')
@Controller('quittances')
export class QuittanceController {
  constructor(private readonly quittanceService: QuittanceService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les quittances' })
  findAll() {
    return this.quittanceService.findAll();
  }

  @Get('verifier')
  @ApiOperation({ summary: "Vérifier l'authenticité d'une quittance (numero + token)" })
  verifier(@Query('numero') numero: string, @Query('token') token?: string) {
    return this.quittanceService.verifierAuthenticite(numero, token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une quittance' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quittanceService.findOne(id);
  }

  @Get(':id/historique')
  @ApiOperation({ summary: "Piste d'audit de la quittance" })
  historique(@Param('id', ParseUUIDPipe) id: string) {
    return this.quittanceService.historique(id);
  }

  @Get(':id/telecharger')
  @ApiOperation({ summary: 'Télécharger / imprimer la quittance (PDF)' })
  async telecharger(@Param('id', ParseUUIDPipe) id: string, @Res() res: express.Response) {
    const pdf = await this.quittanceService.telechargerPdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="quittance_${id}.pdf"`);
    res.end(pdf);
  }

  @Post(':id/annuler')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Annuler une quittance (statut ANNULEE, jamais suppression physique)' })
  annuler(@Param('id', ParseUUIDPipe) id: string, @Body('motif') motif?: string, @Body('acteurId') acteurId?: string) {
    return this.quittanceService.annuler(id, motif, acteurId);
  }

  @Post(':id/correction')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Corriger une référence documentaire (document_url/qr_token)' })
  corriger(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { documentUrl?: string; qrToken?: string; acteurId?: string },
  ) {
    return this.quittanceService.corriger(id, body, body.acteurId);
  }

  @Post(':id/remboursement')
  @ApiOperation({ summary: 'Enregistrer une trace de remboursement (audit)' })
  remboursement(@Param('id', ParseUUIDPipe) id: string, @Body('acteurId') acteurId?: string) {
    return this.quittanceService.enregistrerRemboursement(id, acteurId);
  }

  @Post(':id/synchronisation')
  @ApiOperation({ summary: 'Enregistrer une trace de synchronisation externe (audit)' })
  synchronisation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('acteurId') acteurId?: string,
    @Body('source') source?: string,
  ) {
    return this.quittanceService.enregistrerSynchronisation(id, acteurId, source);
  }
}
