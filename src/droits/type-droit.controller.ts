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
import { CreateTypeDroitDto } from './dto/create-type-droit.dto';
import { UpdateTypeDroitDto } from './dto/update-type-droit.dto';

const PIPES = new ValidationPipe({ transform: true, whitelist: true });

@ApiTags('Types de droit / ticket')
@Controller('type-droits')
export class TypeDroitController {
  constructor(private readonly droitsService: DroitsService) {}

  @Post()
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Créer un type de droit / ticket' })
  create(@Body() dto: CreateTypeDroitDto) {
    return this.droitsService.createTypeDroit(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les types de droit / ticket' })
  findAll() {
    return this.droitsService.findAllTypeDroits();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulter un type de droit / ticket' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.droitsService.findOneTypeDroit(id);
  }

  @Patch(':id')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Modifier un type de droit / ticket (règles de renouvellement, statut)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTypeDroitDto) {
    return this.droitsService.updateTypeDroit(id, dto);
  }
}
