import { Controller, Get, Post, Body, Patch, Param, Delete ,Query,ParseIntPipe} from '@nestjs/common';
import { LocalService } from './local.service';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { ApiBody, ApiResponse,ApiTags,ApiOperation,ApiQuery, } from '@nestjs/swagger';

@ApiTags('Local')
@Controller('local')
export class LocalController {
  constructor(private readonly localService: LocalService) {}

  @Post()
  @ApiOperation({summary:'Créer un nouveau local'})
  create(@Body() createLocalDto: CreateLocalDto) {
    return this.localService.create(createLocalDto);
  }
//   @ApiBody({
//   schema: {
//     type: 'object',
//     properties: {
//       numero: {type: "string"},
//       zoneId: {type: "number"},
//       typelocalId: {type: "number"},
//     }
//   }
// })

  // @Get()
  // @ApiOperation({summary:'RCréer un nouveau local'})
  // findAll() {
  //   return this.localService.findAll();
  // }

  // @Get(':id')
  // @ApiOperation({summary:'RCréer un nouveau local'})
  // findOne(@Param('id') id: string) {
  //   return this.localService.findOne(id);
  // }

  // @Get('disponibleZone/all')
  // @ApiOperation({summary:'Récupere local disponible'})
  // findLocalDisponible() {
  //   return this.localService.findZoneLocalDisponibleParPrix();
  // }

   @Get('zone/:zoneId/type/:typelocalId')
  @ApiOperation({ summary: 'Lister les locaux d’une zone et type, regroupés par statut' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findByZoneAndType(
    @Param('zoneId') zoneId: string,
    @Param('typelocalId', ParseIntPipe) typelocalId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return await this.localService.findByZoneAndType(zoneId, typelocalId, +limit, +page);
  }


   @Get('zone/:zoneId/type/:typelocalId/statut/:statut')
  @ApiOperation({ summary: 'Lister les locaux par statut dans une zone et type' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findByStatut(
    @Param('zoneId') zoneId: string,
    @Param('typelocalId', ParseIntPipe) typelocalId: number,
    @Param('statut') statut: 'DISPONIBLE' | 'LOUE' | 'INDISPONIBLE',
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return await this.localService.findByZoneAndTypeByStatut(zoneId, typelocalId, statut, +limit, +page);
  }


  @Patch(':id')
  @ApiOperation({summary:'RCréer un nouveau local'})
  update(@Param('id') id: string, @Body() updateLocalDto: UpdateLocalDto) {
    return this.localService.update(id, updateLocalDto);
  }

  @Delete(':id')
  @ApiOperation({summary:'RCréer un nouveau local'})
  remove(@Param('id') id: string) {
    return this.localService.remove(id);
  }
}
