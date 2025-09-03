import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DistributionZoneService } from './distribution_zone.service';
import { CreateDistributionZoneDto } from './dto/create-distribution_zone.dto';
import { UpdateDistributionZoneDto } from './dto/update-distribution_zone.dto';

@Controller('distribution-zone')
export class DistributionZoneController {
  constructor(private readonly distributionZoneService: DistributionZoneService) {}

  @Post()
  create(@Body() createDistributionZoneDto: CreateDistributionZoneDto) {
    return this.distributionZoneService.create(createDistributionZoneDto);
  }

  @Get()
  findAll() {
    return this.distributionZoneService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.distributionZoneService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDistributionZoneDto: UpdateDistributionZoneDto) {
    return this.distributionZoneService.update(id, updateDistributionZoneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.distributionZoneService.remove(id);
  }
}
