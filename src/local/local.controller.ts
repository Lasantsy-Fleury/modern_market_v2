import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { LocalService } from './local.service';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { firstValueFrom, } from 'rxjs';
import { isUUID } from 'class-validator';
import { ApiBody, ApiResponse, ApiTags, ApiOperation, ApiQuery, } from '@nestjs/swagger';

@ApiTags('Local')
@Controller('local')
export class LocalController {
  constructor(private readonly localService: LocalService) { }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau local' })
  create(@Body() createLocalDto: CreateLocalDto) {
    return this.localService.create(createLocalDto);
  }


  @Get(':id')
  @ApiOperation({ summary: 'Recuperer un local par son id' })
  findOne(@Param('id') id: string) {
    return this.localService.findOne(id);
  }

  @Get('municipality/:municipalityId')
  @ApiOperation({ summary: 'Récupérer les locaux d’une municipalité avec filtres' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (par défaut 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de résultats par page (par défaut 10)' })
  @ApiQuery({ name: 'zoneId', required: false, type: String, description: 'Filtrer par zone ID' })
  @ApiQuery({ name: 'typelocalId', required: false, type: String, description: 'Filtrer par type de local' })
  @ApiQuery({ name: 'statut', required: false, enum: ['DISPONIBLE', 'LOUE', 'INDISPONIBLE'], description: 'Filtrer par statut' })
  @ApiQuery({ name: 'keyword', required: false, type: String, description: 'Recherche par mot-clé sur le numéro du local' })
  @ApiQuery({ name: 'surface', required: false, type: Number, description: 'Recherche de local ayant a surface inscrite' })
  async getAll(
    @Param('municipalityId', ParseIntPipe) municipalityId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('zoneId') zoneId?: string, // ✅ Pas de ParseIntPipe pour les UUID
    @Query('typelocalId') typelocalId?: string, // ✅ Pas de ParseIntPipe pour les UUID
    @Query('statut') statut?: 'DISPONIBLE' | 'LOUE' | 'INDISPONIBLE',
    @Query('keyword') keyword?: string,
    @Query('surface') surface?: number,
  ) {
    return this.localService.getAll(municipalityId, page, limit, {
      zoneId,
      typelocalId,
      statut,
      keyword,
      surface
    });
  }



  @Get('disponibleZone/all')
  @ApiOperation({summary:'Récupere local disponible'})
  findLocalDisponible() {
    return this.localService.findZoneLocalDisponibleParPrix();
  }

  

  @Patch(':id')
  @ApiOperation({ summary: 'Modification d un local' })
  update(@Param('id') id: string, @Body() updateLocalDto: UpdateLocalDto) {
    return this.localService.update(id, updateLocalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un local' })
  remove(@Param('id') id: string) {
    return this.localService.remove(id);
  }
}
