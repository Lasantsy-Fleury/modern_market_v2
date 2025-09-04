import { Controller, Get, Post, Body, Patch, Delete, Param, } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';

@Controller('zones')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) { }

  @Post()
  create(
    @Body() createZoneDto: CreateZoneDto
  ) {
    return this.zoneService.create(createZoneDto);
  }


  @Get(':municipalityId')
  findAll(@Param('municipalityId') municipalityId: number) {
    return this.zoneService.findAll(+municipalityId);
  }

  @Get(':municipalityId/:id_zone')
  findOne(
    @Param('municipalityId') municipalityId: number,
    @Param('id_zone') id_zone: string,
  ) {
    return this.zoneService.findOne(+municipalityId, id_zone);
  }

  @Get('search/:municipalityId/:mot')
  async search(
    @Param('municipalityId') municipalityId: number,
    @Param('mot') mot: string,
  ) {
    return this.zoneService.searchByName(+municipalityId, mot);
  }


  @Patch(':municipalityId/:id_zone')
  update(
    @Param('municipalityId') municipalityId: number,
    @Param('id_zone') id_zone: string,
    @Body() updateZoneDto: UpdateZoneDto,
  ) {
    return this.zoneService.update(+municipalityId, id_zone, updateZoneDto);
  }

  // @Delete(':municipalityId/:id_zone')
  // remove(
  //   @Param('municipalityId') municipalityId: number,
  //   @Param('id_zone') id_zone: string,
  // ) {
  //   return this.zoneService.remove(+municipalityId, id_zone);
  // }
}
