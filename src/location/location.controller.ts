import { Controller, Get, Post, Body, Patch, Res, NotFoundException, BadRequestException, Query, DefaultValuePipe, ParseIntPipe, Param, ParseUUIDPipe, Delete } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import * as QRCode from 'qrcode';
import { Response } from 'express';
import { ApiResponse, ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';


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
  @ApiOperation({ summary: 'Récupérer tous les locations en cours' })
  findAllInProgress(@Param('municipalityId') municipalityId: number) {
    return this.locationService.findAllInProgress(municipalityId);
  }

  // Toutes les locations d'un utilisateur
  @Get('userLocations/:id_user')
  @ApiOperation({ summary: 'Récupérer toutes les locations d un user en cours ou pas' })
  findByUser(@Param('id_user') id_user: string) {
    return this.locationService.findByUser(id_user);
  }

  // Locations en cours d'un utilisateur
  @Get('userLocations/:id_user/en_cours')
  @ApiOperation({ summary: 'Récupérer toutes les locations d un user en cours seulement' })
  findInProgressByUser(@Param('id_user') id_user: string) {
    return this.locationService.findInProgressByUser(id_user);
  }

  @Get(':id_location/:municipalityId/location')
  @ApiOperation({ summary: 'Récupérer une location par son ID et son municipalityId' })
  @ApiParam({ name: 'municipalityId', required: false, type: Number, description: 'ID de la municipalité' })
  async findOne(
    @Param('id_location') id: string,
    @Param('municipalityId') municipalityId: number,
  ) {
    if (!municipalityId) {
      throw new BadRequestException('Le paramètre "municipalityId" est obligatoire.');
    }
    return this.locationService.findOne(id, municipalityId);
  }

  @Get('locationQrCode/:id/municipality/:municipalityId')
  @ApiOperation({ summary: 'Récupérer le QR Code contenant les infos d\'une location par son id-location' })
  async findOneWithQrcode(
    @Param('id') id: string,
    @Param('municipalityId') municipalityId: string,
    @Res() res: Response
  ) {
    try {
      // Validation des paramètres
      if (!id || !id.trim()) {
        throw new BadRequestException('Le paramètre "id" est requis.');
      }

      const municipalityIdNumber = parseInt(municipalityId, 10);
      if (isNaN(municipalityIdNumber)) {
        throw new BadRequestException('Le paramètre "municipalityId" doit être un nombre valide.');
      }

      // Récupérer les données de location
      const locationData = await this.locationService.findLocationWithPaymentDates(
        municipalityIdNumber,
        id
      );

      if (!locationData) {
        throw new NotFoundException(`Location avec l'ID "${id}" non trouvée.`);
      }

      // Fonction pour formater les dates
      const formatDate = (date: string | Date) => {
        if (!date) return 'Non définie';
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      // Fonction pour formater la périodicité
      const formatPeriodicite = (periodicite: string) => {
        switch (periodicite) {
          case 'MENSUEL': return 'Mensuelle';
          case 'JOURNALIER': return 'Journalière';
          case 'HEBDOMADAIRE': return 'Hebdomadaire';
          default: return periodicite;
        }
      };

      // Fonction pour formater le montant
      const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'MGA', // ou 'EUR' selon votre devise
          minimumFractionDigits: 0
        }).format(amount);
      };

      // === OPTION 1: Format texte structuré et lisible ===
      const readableText = `
        CONTRAT DE LOCATION

NIF :
${locationData.nif}

ID Location:
${locationData.id_location}

Période de Location:
• Début: ${formatDate(locationData.date_debut_loc)}
• Fin: ${formatDate(locationData.date_fin_loc)}

Informations du place:
• Tarif: ${formatAmount(locationData.tarif)}
• Périodicité: ${formatPeriodicite(locationData.periodicite)}

Dernier Paiement:
${locationData.derniere_date_payer ? formatDate(locationData.derniere_date_payer) : 'Aucun paiement'}

Référence Locale:
${locationData.local_id || 'Non spécifié'}

Contrat valide jusqu'au
${formatDate(locationData.date_fin_loc)}
`.trim();
      const structuredData = {
        "CONTRAT_DE_LOCATION": {
          "NIF": locationData.nif,
          "ID_Location": locationData.id_location,
          "Periode": {
            "Debut": formatDate(locationData.date_debut_loc),
            "Fin": formatDate(locationData.date_fin_loc),
            "Type": formatPeriodicite(locationData.periodicite)
          },
          "Finances": {
            "Tarif": formatAmount(locationData.tarif),
            "Dernier_Paiement": locationData.derniere_date_payer ? formatDate(locationData.derniere_date_payer) : 'Aucun'
          },
          "Reference_Locale": locationData.local_id || 'Non spécifié',
          "Statut": "Actif"
        }
      };
      const qrContent = readableText;

      // Générer le QR code
      const qrCodeBuffer = await QRCode.toBuffer(qrContent, {
        type: 'png',
        width: 400, // Taille plus grande pour la lisibilité
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H' // Haute correction d'erreur
      });

      // Envoyer la réponse
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="contrat-location-${id}.png"`);
      res.send(qrCodeBuffer);

    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);

      if (error instanceof NotFoundException) {
        return res.status(404).json({
          message: error.message,
          error: 'Not Found',
          statusCode: 404
        });
      }

      if (error instanceof BadRequestException) {
        return res.status(400).json({
          message: error.message,
          error: 'Bad Request',
          statusCode: 400
        });
      }

      return res.status(500).json({
        message: 'Erreur lors de la génération du QR code',
        error: 'Internal Server Error',
        statusCode: 500
      });
    }
  }

  @Get('in-progress/:id_user/:id_controleur')
  @ApiOperation({ summary: 'Récupérer les locations en cours pour un contribuable' })
  @ApiParam({ name: 'id_user', required: true, type: 'string', description: "ID de l'utilisateur" })
  @ApiParam({ name: 'id_controleur', required: true, type: 'string', description: "ID du contrôleur" })
  async findInProgress(
    @Param('id_user', new ParseUUIDPipe()) id_user: string,
    @Param('id_controleur', new ParseUUIDPipe()) id_controleur: string,
  ) {
    return this.locationService.findInProgressByUserByControlleur(id_user, id_controleur);
  }

  @Get('/:id_location/reste-a-payer')
  @ApiOperation({ summary: 'Recuperer le reste a payer d\'une location par son id ' })
  async getRemainingAmount(@Param('id_location') id: string) {
    return this.locationService.getRemainingAmount(id);
  }

  @Get('/:id_location/calendrier-paiement')
  async getPaymentSchedule(@Param('id_location') id: string) {
    return this.locationService.getPaymentSchedule(id);
  }

  @Patch('municipality/:municipalityId/location/:id')
  @ApiOperation({ summary: 'Modifier une location par son ID et son municipalityId' })
  @ApiResponse({ status: 200, description: 'La location a été mise à jour avec succès.' })
  update(
    @Param('id_location') id: string,
    @Param('municipalityId') municipalityId: number,
    @Body() updateDto: CreateLocationDto
  ) {
    if (!municipalityId) {
      throw new BadRequestException('Le paramètre "municipalityId" est obligatoire.');
    }
    return this.locationService.update(municipalityId, id, updateDto);
  }


  @Delete('location/:id')
  @ApiOperation({ summary: 'Supprimer une location par son ID' })
  @ApiResponse({ status: 204, description: 'La location a été supprimée avec succès.' })
  async remove(@Param('id') id: string) {
    await this.locationService.remove(id);
    return { message: 'Location supprimée avec succès.' };
  }

  @Get('nif-user/:userId')
  @ApiOperation({ summary: 'Récupérer le nif d\'un user par son id-user' })
  async getNifByUserId(@Param('userId') userId: string) {
    return this.locationService.getNifByUserId(userId);
  }

  @Get('count-current/locations/user/:id_user')
  @ApiOperation({ summary: 'Récupérer le nombre de locations en cours d\'un user' })
  async countCurrentLocationsByUser(@Param('id_user') id_user: string) {
    return this.locationService.countCurrentLocationsByUser(id_user);
  }

  @Get('/:id_location/end-date')
  @ApiOperation({ summary: 'Récupérer la date de fin d\'une location par son ID' })
  @ApiResponse({ status: 200, description: 'Date de fin de la location trouvée avec succès.' })
  @ApiResponse({ status: 404, description: 'Location non trouvée.' })
  async getLocationEndDate(@Param('id_location') id: string) {
    return this.locationService.getLocationEndDate(id);
  }

  @Get(':id/qrcode')
  @ApiOperation({ summary: 'Générer un QR code pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'QR Code généré avec succès' })
  async getUserQrCode(@Param('id') id: string) {
    return await this.locationService.generateUserQrCode(id);
  }
}
