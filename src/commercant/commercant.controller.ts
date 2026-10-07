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
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommercantService } from './commercant.service';
import { CreateCommercantDto } from './dto/create-commercant.dto';
import { UpdateCommercantDto } from './dto/update-commercant.dto';
import { QueryCommercantDto } from './dto/query-commercant.dto';

@ApiTags('Commerçants')
@Controller('commercants')
export class CommercantController {
  constructor(private readonly commercantService: CommercantService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Créer un commerçant' })
  @ApiResponse({ status: 201, description: 'Commerçant créé.' })
  create(@Body() dto: CreateCommercantDto) {
    return this.commercantService.create(dto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Rechercher / filtrer les commerçants' })
  findAll(@Query() query: QueryCommercantDto) {
    return this.commercantService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un commerçant' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.commercantService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Modifier un commerçant' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommercantDto,
  ) {
    return this.commercantService.update(id, dto);
  }

  @Get(':id/historique')
  @ApiOperation({ summary: "Historique / traçabilité du commerçant" })
  getHistorique(@Param('id', ParseUUIDPipe) id: string) {
    return this.commercantService.getHistorique(id);
  }

  @Get(':id/activite')
  @ApiOperation({ summary: "Consulter l'activité du commerçant" })
  getActivite(@Param('id', ParseUUIDPipe) id: string) {
    return this.commercantService.getActivite(id);
  }

  @Get(':id/emplacements')
  @ApiOperation({ summary: 'Consulter les emplacements (affectations + locations)' })
  getEmplacements(@Param('id', ParseUUIDPipe) id: string) {
    return this.commercantService.getEmplacements(id);
  }

  @Get(':id/presences')
  @ApiOperation({ summary: 'Consulter les présences' })
  getPresences(@Param('id', ParseUUIDPipe) id: string) {
    return this.commercantService.getPresences(id);
  }

  @Get(':id/situation-financiere')
  @ApiOperation({ summary: 'Consulter la situation financière (redevances + soldes)' })
  getSituationFinanciere(@Param('id', ParseUUIDPipe) id: string) {
    return this.commercantService.getSituationFinanciere(id);
  }

  @Get(':id/paiements')
  @ApiOperation({ summary: 'Consulter les paiements' })
  getPaiements(@Param('id', ParseUUIDPipe) id: string) {
    return this.commercantService.getPaiements(id);
  }

  @Get(':id/quittances')
  @ApiOperation({ summary: 'Consulter les quittances' })
  getQuittances(@Param('id', ParseUUIDPipe) id: string) {
    return this.commercantService.getQuittances(id);
  }
}
