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

  // Dans location.controller.ts - Méthode corrigée

@Get('qr-code/:id/municipality/:municipalityId')
@ApiOperation({summary:'Récupérer le QR Code contenant les infos d\'une location par son id-location'})
async findOneWithQrcode(
  @Param('id') id: string,
  @Param('municipalityId') municipalityId: string, // Changé en string pour validation
  @Res() res: Response
) {
  try {
    // 1. Validation des paramètres
    if (!id || !id.trim()) {
      throw new BadRequestException('Le paramètre "id" est requis.');
    }

    if (!municipalityId || !municipalityId.trim()) {
      throw new BadRequestException('Le paramètre "municipalityId" est requis.');
    }

    const municipalityIdNumber = parseInt(municipalityId, 10);
    if (isNaN(municipalityIdNumber)) {
      throw new BadRequestException('Le paramètre "municipalityId" doit être un nombre valide.');
    }

    console.log(`Génération QR code pour location: ${id}, municipality: ${municipalityIdNumber}`);

    // 2. Récupérer les données de location
    const locationData = await this.locationService.findLocationWithPaymentDates(
      municipalityIdNumber, 
      id
    );

    if (!locationData) {
      throw new NotFoundException(`Location avec l'ID "${id}" non trouvée.`);
    }

    console.log('Données de location récupérées:', locationData);

    // 3. Préparer les données pour le QR code (structure simplifiée)
    const qrData = {
      id_location: locationData.id_location,
      periodicite: locationData.periodicite,
      date_debut: locationData.date_debut_loc,
      date_fin: locationData.date_fin_loc,
      tarif: locationData.tarif,
      derniere_date_paiement: locationData.derniere_date_payer
    };

    // 4. Convertir en JSON string
    const jsonString = JSON.stringify(qrData, null, 2);
    console.log('JSON pour QR code:', jsonString);

    // 5. Générer le QR code avec options optimisées
    const qrCodeBuffer = await QRCode.toBuffer(jsonString, { 
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    // 6. Envoyer la réponse
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="qr-location-${id}.png"`);
    res.send(qrCodeBuffer);

  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    
    // Gestion d'erreur détaillée
    if (error instanceof NotFoundException) {
      return res.status(404).json({
        error: 'Location non trouvée',
        message: error.message
      });
    }
    
    if (error instanceof BadRequestException) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        message: error.message
      });
    }
    
    // Erreur générique avec plus de détails
    return res.status(500).json({
      error: 'Erreur lors de la génération du QR code',
      message: error.message || 'Erreur interne du serveur'
    });
  }
}

  @Get(':id/reste-a-payer')
  async getRemainingAmount(@Param('id') id: string) {
    return this.locationService.getRemainingAmount(id);
  }

  @Get(':id/calendrier-paiement')
  async getPaymentSchedule(@Param('id') id: string) {
    return this.locationService.getPaymentSchedule(id);
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
