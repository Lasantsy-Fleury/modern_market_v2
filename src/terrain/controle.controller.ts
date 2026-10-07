import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TerrainService } from './terrain.service';
import { CreateControleDto, UpdateControleDto } from './dto/create-controle.dto';

const PIPES = new ValidationPipe({ transform: true, whitelist: true });

@ApiTags('Contrôles')
@Controller('controles')
export class ControleController {
  constructor(private readonly terrainService: TerrainService) {}

  @Post()
  @UsePipes(PIPES)
  @ApiOperation({
    summary: 'Enregistrer un contrôle terrain (agent, emplacement attendu, GPS, résultat)',
  })
  create(@Body() dto: CreateControleDto) {
    return this.terrainService.createControle(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les contrôles avec filtres' })
  @ApiQuery({ name: 'commercantId', required: false })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiQuery({ name: 'agentId', required: false })
  @ApiQuery({ name: 'statut', required: false })
  @ApiQuery({ name: 'resultat', required: false })
  findAll(
    @Query('commercantId') commercantId?: string,
    @Query('zoneId') zoneId?: string,
    @Query('agentId') agentId?: string,
    @Query('statut') statut?: string,
    @Query('resultat') resultat?: string,
  ) {
    return this.terrainService.findAllControles({ commercantId, zoneId, agentId, statut, resultat });
  }

  @Get('historique/:commercantId')
  @ApiOperation({ summary: "Historique des contrôles d'un commerçant" })
  historique(@Param('commercantId', ParseUUIDPipe) commercantId: string) {
    return this.terrainService.historiqueControles(commercantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un contrôle' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.terrainService.findOneControle(id);
  }

  @Patch(':id')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Enrichir / clôturer un contrôle (observations, anomalie, statut)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateControleDto) {
    return this.terrainService.updateControle(id, dto);
  }
}
