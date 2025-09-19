import { Controller, Get, Post, Body, Param, Delete, NotFoundException, ParseIntPipe, HttpCode, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { PaiementLocationService } from './paiement_location.service';
import { CreatePaiementLocationDto } from './dto/create-paiement_location.dto';
import { Paiementlocation } from './entities/paiement_location.entity';
import { ApiResponse, ApiTags, ApiOperation , ApiParam, ApiQuery} from '@nestjs/swagger';


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

  @Get(':id/qr')
  @ApiOperation({ summary: 'Récupérer un paiement de location avec QR code par son ID et municipalité' })
  @ApiQuery({ name: 'municipalityId', required: true, type: Number, description: 'ID de la municipalité' })
  async findOneWithQr(
    @Param('id') id: string,
    @Query('municipalityId') municipalityId: number,
  ): Promise<{ paiementLocation: Paiementlocation; qrCode: string }> {
    if (!municipalityId) {
      throw new BadRequestException('Le municipalityId est obligatoire.');
    }
    return this.paiementLocationService.findOneWithQr(id, municipalityId);
  }
 
}