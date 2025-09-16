import { Controller, Get, Post, Body, Patch, Param, Res, NotFoundException, BadRequestException, Query, DefaultValuePipe, ParseIntPipe, Delete } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import * as QRCode from 'qrcode';
import { Response } from 'express';
import { ApiResponse,ApiTags,ApiOperation, ApiQuery } from '@nestjs/swagger';


@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @Post('valider-la-location-apres-avoir-fait-le-paiement')
  @ApiOperation({ summary: 'Créer un nouvelle location et le valider' })
  @ApiResponse({ status: 201, description: 'L\'utilisateur a été affecté à la zone de distribution avec succès.' })
  async createAndValidate(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les locations, filtrées par municipalityId' })
  @ApiQuery({ name: 'municipalityId', required: true, type: Number, description: 'ID de la municipalité' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de la page (par défaut 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de résultats par page (par défaut 10)' })
  async findAll(
    @Query('municipalityId') municipalityId: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    if (!municipalityId) {
      throw new BadRequestException('Le paramètre "municipalityId" est obligatoire.');
    }
    return this.locationService.findAll(municipalityId, page, limit);
  }


  @Get('municipality/:municipalityId/en_cours')
  @ApiOperation({summary:'Récupérer tous les locations en cours'})
  findAllInProgress(@Param('municipalityId') municipalityId: number) {
    return this.locationService.findAllInProgress(municipalityId);
  }

  // Toutes les locations d'un utilisateur
  @Get('userLocations/:id_user')
  @ApiOperation({summary:'Récupérer toutes les locations d un user en cours ou pas'})
  findByUser(@Param('id_user') id_user: string) {
    return this.locationService.findByUser(id_user);
  }

  // Locations en cours d'un utilisateur
  @Get('userLocations/:id_user/en_cours')
  @ApiOperation({summary:'Récupérer toutes les locations d un user en cours seulement'})
  findInProgressByUser(@Param('id_user') id_user: string) {
    return this.locationService.findInProgressByUser(id_user);
  }

  @Get('municipalityId/:municipalityId/location')
  @ApiOperation({ summary: 'Récupérer une location par son ID et son municipalityId' })
  @ApiQuery({ name: 'municipalityId', required: true, type: Number, description: 'ID de la municipalité' })
  async findOne(
    @Param('id') id: string,
    @Query('municipalityId') municipalityId: number,
  ) {
    if (!municipalityId) {
      throw new BadRequestException('Le paramètre "municipalityId" est obligatoire.');
    }
    return this.locationService.findOne(id, municipalityId);
  }

  @Get('locationQrCode/:id/municipality/:municipalityId')
  @ApiOperation({summary:'Récupérer le qr Code contenant les infos d une location par son id-location '})
  async findOneWithQrcode(@Param('id') id: string, @Param('municipalityId') municipalityId: number, @Res() res: Response) {
    const location = await this.locationService.findLocationWithPaymentDates(municipalityId, id);
    if (!location) {
      throw new NotFoundException('Location not found.');
    }

    // Convert the data into a JSON string for encoding.
    // We'll only include relevant fields to keep the QR code simple.
    const locationData = {
      id: location.id_location,
      tarif: location.tarif,
      periodicite: location.periodicite,
      date_debut: location.date_debut_loc,
      date_fin: location.date_fin_loc,
      frequence: location.frequence,
    };
    const jsonString = JSON.stringify(locationData);

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

  @Patch('municipality/:municipalityId/location/:id')
  @ApiOperation({ summary: 'Modifier une location par son ID et son municipalityId' })
  @ApiResponse({ status: 200, description: 'La location a été mise à jour avec succès.' })
  update(
    @Param('id') id: string,
    @Param('municipalityId') municipalityId: number,
    @Body() updateDto:CreateLocationDto
  ) {
    if (!municipalityId) {
      throw new BadRequestException('Le paramètre "municipalityId" est obligatoire.');
    }
    return this.locationService.update(municipalityId, id, updateDto);
  }

  @Delete('municipality/:municipalityId/location/:id')
  @ApiOperation({ summary: 'Supprimer une location par son ID et son municipalityId' })
  @ApiQuery({ name: 'municipalityId', required: true, type: Number, description: 'ID de la municipalité' })
  @ApiResponse({ status: 204, description: 'La location a été supprimée avec succès.' })
  async remove(
    @Query('municipalityId') municipalityId: number,
    @Param('id') id: string,
  ) {
    if (!municipalityId) {
      throw new BadRequestException('Le paramètre "municipalityId" est obligatoire.');
    }
    await this.locationService.remove(municipalityId, id);
    return { message: 'Location supprimée avec succès.' };
  }

}
