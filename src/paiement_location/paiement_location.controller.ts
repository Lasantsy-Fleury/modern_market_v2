import { Controller, Get, Post, Body, Param, Delete, NotFoundException, ParseIntPipe, HttpCode, HttpStatus, Query, BadRequestException, Res } from '@nestjs/common';
import { PaiementLocationService } from './paiement_location.service';
import { CreatePaiementLocationDto } from './dto/create-paiement_location.dto';
import { Paiementlocation } from './entities/paiement_location.entity';
import { ApiResponse, ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import * as QRCode from 'qrcode';
import { Response } from 'express';

@ApiTags('Paiement-location')
@Controller('paiement-location')
export class PaiementLocationController {
  constructor(private readonly paiementLocationService: PaiementLocationService) { }



  @Get('municipality/:municipalityId')
  @ApiOperation({ summary: 'Récupérer les paiements de location pour une municipalité avec filtres' })
  @ApiParam({ name: 'municipalityId', type: Number, description: 'ID de la municipalité' })
  @ApiQuery({ name: 'locationId', required: false, type: String })
  @ApiQuery({ name: 'paiementId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Date de début au format YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Date de fin au format YYYY-MM-DD' })
  async findAll(
    @Param('municipalityId') municipalityId: number,
    @Query('locationId') locationId?: string,
    @Query('paiementId') paiementId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Paiementlocation[]> {
    if (!municipalityId) {
      throw new BadRequestException('Le municipalityId est obligatoire.');
    }

    return this.paiementLocationService.findAll(municipalityId, {
      locationId,
      paiementId,
      startDate,
      endDate,
    });
  }


  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un paiement de location par son ID et municipalité' })
  @ApiQuery({ name: 'municipalityId', required: true, type: Number, description: 'ID de la municipalité' })
  async findOne(
    @Param('id') id: string,
    @Query('municipalityId') municipalityId: number,
  ): Promise<Paiementlocation> {
    if (!municipalityId) {
      throw new BadRequestException('Le municipalityId est obligatoire.');
    }
    return this.paiementLocationService.findOne(id, municipalityId);
  }


  @Get(':id/qr/png')
  @ApiOperation({ summary: 'Récupérer le QR code en image PNG' })
  @ApiQuery({
    name: 'municipalityId',
    required: true,
    type: Number,
    description: 'ID de la municipalité',
  })
  async getQrPng(
    @Param('id') id: string,
    @Query('municipalityId') municipalityId: number,
    @Res() res: Response,
  ) {
    if (!municipalityId) {
      throw new BadRequestException('Le municipalityId est obligatoire.');
    }
    const paiementLoc = await this.paiementLocationService.findOneWithQr(id, municipalityId);
    if (!paiementLoc) {
      throw new NotFoundException('PaiementLocation not found.');

    }
    const paieLocData = {
      id_paiement_location: paiementLoc.id_paiement_location,
      nombre_paye: paiementLoc.nombre_paye,
      date_debut: paiementLoc.date_debut,
      date_fin: paiementLoc.date_fin,
      date_paiement: paiementLoc.date_paiement,
      montant_paye: paiementLoc.montant_paye,
      paiement: paiementLoc.paiement,
      location: paiementLoc.location,
    }

    const jsonString = JSON.stringify(paieLocData);

    try {
      // Generate the QR code as a PNG image buffer.
      const qrCodeBuffer = await QRCode.toBuffer(jsonString, { type: 'png' });

      // Set headers to tell the browser it's an image.
      res.setHeader('Content-Type', 'image/png');

      // Send the image buffer.
      res.send(qrCodeBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error generating QR code.');
    }
  }



}