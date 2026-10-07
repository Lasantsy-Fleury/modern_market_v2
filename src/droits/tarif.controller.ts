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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DroitsService } from './droits.service';
import { CreateTarifDto } from './dto/create-tarif.dto';
import { UpdateTarifDto } from './dto/update-tarif.dto';
import { ResoudreTarifQueryDto } from './dto/resoudre-tarif.query.dto';

const PIPES = new ValidationPipe({ transform: true, whitelist: true });

@ApiTags('Tarifs')
@Controller('tarifs')
export class TarifController {
  constructor(private readonly droitsService: DroitsService) {}

  @Post()
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Créer un tarif (dimensions configurables + validité)' })
  create(@Body() dto: CreateTarifDto) {
    return this.droitsService.createTarif(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les tarifs' })
  findAll() {
    return this.droitsService.findAllTarifs();
  }

  @Get('resoudre')
  @UsePipes(PIPES)
  @ApiOperation({
    summary: 'Résoudre les tarifs applicables (actifs et dans leur période de validité)',
  })
  resoudre(@Query() q: ResoudreTarifQueryDto) {
    return this.droitsService.resoudreTarifs(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un tarif' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.droitsService.findOneTarif(id);
  }

  @Patch(':id')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Modifier un tarif (statut actif/inactif compris)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTarifDto) {
    return this.droitsService.updateTarif(id, dto);
  }
}
