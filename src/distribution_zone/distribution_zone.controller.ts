import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DistributionZoneService } from './distribution_zone.service';
import { CreateDistributionZoneDto } from './dto/create-distribution_zone.dto';
import { UpdateDistributionZoneDto } from './dto/update-distribution_zone.dto';
import { ApiResponse,ApiTags,ApiOperation } from '@nestjs/swagger';

@ApiTags('Distribution-zone')
@Controller('distribution-zone')
export class DistributionZoneController {
  constructor(private readonly distributionZoneService: DistributionZoneService) {}

  @Post()
@ApiOperation({summary:'creer une nouvelle distribution zone:affecter un controleur a une distribution zone'})
@ApiResponse({status:201,description:'la distribution zone a été créé avec succès.'})
@ApiResponse({status:400,description:'Requête invalide.'})
  create(@Body() createDistributionZoneDto: CreateDistributionZoneDto) {
    return this.distributionZoneService.create(createDistributionZoneDto);
  }

  @Get()
  @ApiOperation({summary:'Récupérer tous les distributions zones'})
  findAll() {
    return this.distributionZoneService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary:'Récupérer une distribution zone par son id'})
  findOne(@Param('id') id: string) {
    return this.distributionZoneService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({summary:'?odifier une distribution zone'})
  update(@Param('id') id: string, @Body() updateDistributionZoneDto: UpdateDistributionZoneDto) {
    return this.distributionZoneService.update(id, updateDistributionZoneDto);
  }

  @Delete(':id')
  @ApiOperation({summary:'Supprimer une distribution zone'})
  remove(@Param('id') id: string) {
    return this.distributionZoneService.remove(id);
  }
}
