import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TerrainService } from './terrain.service';
import { CreatePresenceDto } from './dto/create-presence.dto';

const PIPES = new ValidationPipe({ transform: true, whitelist: true });

@ApiTags('Présences')
@Controller('presences')
export class PresenceController {
  constructor(private readonly terrainService: TerrainService) {}

  @Post()
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Enregistrer une présence (GPS, manuel ou scan)' })
  create(@Body() dto: CreatePresenceDto) {
    return this.terrainService.createPresence(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les présences (filtre commerçant optionnel)' })
  @ApiQuery({ name: 'commercantId', required: false })
  findAll(@Query('commercantId') commercantId?: string) {
    return this.terrainService.findAllPresences(commercantId);
  }
}
