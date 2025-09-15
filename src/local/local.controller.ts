import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, DefaultValuePipe,ParseUUIDPipe } from '@nestjs/common';
import { LocalService } from './local.service';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { ApiTags, ApiOperation, ApiQuery, } from '@nestjs/swagger';

@ApiTags('Local')
@Controller('local')
export class LocalController {
  constructor(private readonly localService: LocalService) { }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau local' })
  create(@Body() createLocalDto: CreateLocalDto) {
    return this.localService.create(createLocalDto);
  }



  @Get('getAll/municipality/:municipalityId')
  @ApiOperation({ summary: 'Récupérer les locaux d’une municipalité avec filtres' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (par défaut 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de résultats par page (par défaut 10)' })
  @ApiQuery({ name: 'zoneId', required: false, type: String, description: 'Filtrer par zone ID' })
  @ApiQuery({ name: 'typelocalId', required: false, type: String, description: 'Filtrer par type de local' })
  @ApiQuery({ name: 'statut', required: false, enum: ['DISPONIBLE', 'LOUE', 'INDISPONIBLE'], description: 'Filtrer par statut' })
  @ApiQuery({ name: 'keyword', required: false, type: String, description: 'Recherche par mot-clé sur le numéro du local' })
  @ApiQuery({ name: 'surface', required: false, type: Number, description: 'Recherche de local ayant a surface inscrite' })
  // @ApiQuery({ name: 'latitude', required: true, type: Number, description: 'Latitude du local' })
  // @ApiQuery({ name: 'longitude', required: true, type: Number, description: 'Longitude du local'})
  async getAll(
    @Param('municipalityId', ParseIntPipe) municipalityId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('zoneId') zoneId?: string, // ✅ Pas de ParseIntPipe pour les UUID
    @Query('typelocalId') typelocalId?: string, // ✅ Pas de ParseIntPipe pour les UUID
    @Query('statut') statut?: 'DISPONIBLE' | 'LOUE' | 'INDISPONIBLE',
    @Query('keyword') keyword?: string,
    @Query('surface') surface?: number,
    // @Query('latitude') latitude?: number,
    // @Query('longitude') longitude?: number
  ) {
    return this.localService.getAll(municipalityId, page, limit, {
      zoneId,
      typelocalId,
      statut,
      keyword,
      surface,
      // latitude,
      // longitude
    });
  }


 @Get('municipality/:municipalityId/:id_local')
  async findOne(
    @Param('municipalityId') municipalityId: number,
    @Param('id_local', ParseUUIDPipe) id_local: string,
  ) {
    return this.localService.findOne(municipalityId, id_local);
  }

  // Mettre à jour un local
  @Patch('municipality/:municipalityId/:id_local')
  async update(
    @Param('municipalityId') municipalityId: number,
    @Param('id_local', ParseUUIDPipe) id_local: string,
    @Body() updateLocalDto: UpdateLocalDto,
  ) {
    return this.localService.update(municipalityId, id_local, updateLocalDto);
  }

  // Supprimer un local
  @Delete('municipality/:municipalityId/:id_local')
  async remove(
    @Param('municipalityId') municipalityId: number,
    @Param('id_local', ParseUUIDPipe) id_local: string,
  ) {
    return this.localService.remove(municipalityId, id_local);
  }
}
