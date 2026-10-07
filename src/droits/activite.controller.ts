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
import { CreateActiviteDto } from './dto/create-activite.dto';
import { UpdateActiviteDto } from './dto/update-activite.dto';

const PIPES = new ValidationPipe({ transform: true, whitelist: true });

@ApiTags('Activités commerciales')
@Controller('activites-commerciales')
export class ActiviteController {
  constructor(private readonly droitsService: DroitsService) {}

  @Post()
  @UsePipes(PIPES)
  @ApiOperation({ summary: "Créer un type d'activité" })
  create(@Body() dto: CreateActiviteDto) {
    return this.droitsService.createActivite(dto);
  }

  @Get()
  @ApiOperation({ summary: "Lister les types d'activité" })
  findAll() {
    return this.droitsService.findAllActivites();
  }

  @Get(':id')
  @ApiOperation({ summary: "Consulter un type d'activité" })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.droitsService.findOneActivite(id);
  }

  @Patch(':id')
  @UsePipes(PIPES)
  @ApiOperation({ summary: "Modifier un type d'activité (statut actif/inactif)" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateActiviteDto) {
    return this.droitsService.updateActivite(id, dto);
  }
}
