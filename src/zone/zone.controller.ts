import { Controller, Get, Post, Body, Patch, Delete, Param ,} from '@nestjs/common';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';

@Controller('zones')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) {}

  @Post()
  create(
    @Param('municipalityId') municipalityId: number,
    @Body() createZoneDto: CreateZoneDto,
  ) {
    return this.zoneService.create(+municipalityId, createZoneDto);
  }

  @Get()
  findAll(@Param('municipalityId') municipalityId: number) {
    return this.zoneService.findAll(+municipalityId);
  }

  @Get(':nom')
  findOne(
    @Param('municipalityId') municipalityId: number,
    @Param('nom') nom: string,
  ) {
    return this.zoneService.findOne(+municipalityId, nom);
  }

  @Patch(':nom')
  update(
    @Param('municipalityId') municipalityId: number,
    @Param('nom') nom: string,
    @Body() updateZoneDto: UpdateZoneDto,
  ) {
    return this.zoneService.update(+municipalityId, nom, updateZoneDto);
  }

  @Delete(':nom')
  remove(
    @Param('municipalityId') municipalityId: number,
    @Param('nom') nom: string,
  ) {
    return this.zoneService.remove(+municipalityId, nom);
  }
}
