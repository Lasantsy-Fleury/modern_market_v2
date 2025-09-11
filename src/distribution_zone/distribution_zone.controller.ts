import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DistributionZoneService } from './distribution_zone.service';
import { CreateDistributionZoneDto } from './dto/create-distribution_zone.dto';
import { UpdateDistributionZoneDto } from './dto/update-distribution_zone.dto';
import { ApiResponse,ApiTags,ApiOperation } from '@nestjs/swagger';

@ApiTags('Distribution-zone')
@Controller('distribution-zone')
export class DistributionZoneController {
  constructor(private readonly distributionZoneService: DistributionZoneService) {}

  @Post('assign')
  @ApiOperation({summary:'Affecter un utilisateur à une zone de distribution'})
  @ApiResponse({status:201,description:'L\'utilisateur a été affecté à la zone de distribution avec succès.'})
  @ApiResponse({status:400,description:'Requête invalide.'})
  async assignUserToZone(
    @Body() dto: CreateDistributionZoneDto
  ) {
    return this.distributionZoneService.create(dto);
  }

  @Get()
  @ApiOperation({summary:'Récupérer toutes les zones de distribution'})
  findAll() {
    return this.distributionZoneService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary:'Récupérer une zone de distribution par son id'})
  findOne(@Param('id') id: string) {
    return this.distributionZoneService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({summary:'Modifier une zone de distribution'})
  update(@Param('id') id: string, @Body() updateDistributionZoneDto: UpdateDistributionZoneDto) {
    return this.distributionZoneService.update(id, updateDistributionZoneDto);
  }

  @Delete(':id')
  @ApiOperation({summary:'Supprimer une zone de distribution'})
  remove(@Param('id') id: string) {
    return this.distributionZoneService.remove(id);
  }
}
