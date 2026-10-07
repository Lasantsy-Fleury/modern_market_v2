import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DroitsService } from './droits.service';
import { CreatePeriodiciteDto } from './dto/create-periodicite.dto';
import { UpdatePeriodiciteDto } from './dto/update-periodicite.dto';

const PIPES = new ValidationPipe({ transform: true, whitelist: true });

@ApiTags('Périodicités')
@Controller('periodicites')
export class PeriodiciteController {
  constructor(private readonly droitsService: DroitsService) {}

  @Post()
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Créer une périodicité (ex. JOURNALIERE, MENSUELLE, ANNUELLE)' })
  create(@Body() dto: CreatePeriodiciteDto) {
    return this.droitsService.createPeriodicite(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les périodicités' })
  findAll() {
    return this.droitsService.findAllPeriodicites();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une périodicité' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.droitsService.findOnePeriodicite(id);
  }

  @Patch(':id')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Modifier une périodicité (statut actif/inactif compris)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePeriodiciteDto) {
    return this.droitsService.updatePeriodicite(id, dto);
  }
}
