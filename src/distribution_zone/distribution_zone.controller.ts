import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, ParseIntPipe, BadRequestException, Query } from '@nestjs/common';
import { DistributionZoneService } from './distribution_zone.service';
import { CreateDistributionZoneDto } from './dto/create-distribution_zone.dto';
import { UpdateDistributionZoneDto } from './dto/update-distribution_zone.dto';
import { ApiResponse,ApiTags,ApiOperation, ApiQuery } from '@nestjs/swagger';

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

  @Get('municipalityId/:municipalityId')
   @ApiOperation({summary:'Récupérer toutes les zones de distribution par leur municipalité'})
  @ApiQuery({ name: 'municipalityId', required: true, type: Number, description: 'ID de la municipalité' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de la page (par défaut 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de résultats par page (par défaut 10)' })
  async findAll(
    @Query('municipalityId') municipalityId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (!municipalityId) {
      throw new BadRequestException('Le paramètre "municipalityId" est obligatoire.');
    }
    return this.distributionZoneService.findAll(municipalityId, page, limit);
  }

  @Get('municipalityId/:municipalityId/id/:id')
  @ApiOperation({summary:'Récupérer une zone de distribution par son id'})
  findOne(@Param('id') id: string, @Param('municipalityId') municipalityId: number) {
    return this.distributionZoneService.findOne(id, municipalityId);
  }

  @Get('municipalityId/:municipalityId/id_user/:id_user')
  @ApiOperation({summary:'Récupérer une zone qui est affectée par l\'id utilisateur'})
  findOneByidUser(@Param('id_user') id_user: string, @Param('municipalityId') municipalityId: number) {
    return this.distributionZoneService.findOneByidUser(id_user, municipalityId);
  }

  @Patch('municipalityId/:municipalityId/id/:id')
  @ApiOperation({summary:'Modifier une zone de distribution'})
  update(@Param('id') id: string, @Param('municipalityId') municipalityId: number, @Body() updateDistributionZoneDto: UpdateDistributionZoneDto) {
    return this.distributionZoneService.update(id, municipalityId, updateDistributionZoneDto);
  }

  @Delete('municipalityId/:municipalityId/id/:id')
  @ApiOperation({summary:'Supprimer une zone de distribution'})
  remove(@Param('id') id: string, @Param('municipalityId') municipalityId: number) {
    return this.distributionZoneService.remove(id, municipalityId);
  }
}
