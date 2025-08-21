import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DistributionZoneService } from './distribution_zone.service';
import { CreateDistributionZoneDto } from './dto/create-distribution_zone.dto';
import { UpdateDistributionZoneDto } from './dto/update-distribution_zone.dto';

@Controller('distribution-zone')
export class DistributionZoneController {
  constructor(private readonly distributionZoneService: DistributionZoneService) { }

  @Post()
  create(@Body() createDistributionZoneDto: CreateDistributionZoneDto) {
    return this.distributionZoneService.create(createDistributionZoneDto);
  }

  @Get()
  findAll(@Query('municipality_id') municipality_id: string) {
    return this.distributionZoneService.findAll(+municipality_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('municipality_id') municipality_id: string) {
    return this.distributionZoneService.findOne(+id, +municipality_id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('municipality_id') municipality_id: string,
    @Body() updateDistributionZoneDto: UpdateDistributionZoneDto,
  ) {
    return this.distributionZoneService.update(+id, +municipality_id, updateDistributionZoneDto);
  }

}
