import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';

@Controller('servicemarche/zone')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) { }

  @Post()
  create(@Body() createZoneDto: CreateZoneDto) {
    return this.zoneService.create(createZoneDto);
  }

  @Get()
  findAll(@Query('municipality_id') municipality_id?: string) {
    return this.zoneService.findAll(municipality_id ? +municipality_id : undefined);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Param('municipality_id') municipality_id?: string,
  ) {
    return this.zoneService.findOne(+id, municipality_id ? +municipality_id : undefined);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateZoneDto: UpdateZoneDto,
    @Param('municipality_id') municipality_id?: string,
  ) {
    return this.zoneService.update(+id, updateZoneDto, municipality_id ? +municipality_id : undefined);
  }


}
