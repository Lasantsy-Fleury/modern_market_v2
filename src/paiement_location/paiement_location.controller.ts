import { Controller, Get, Post, Body, Param, Delete, NotFoundException, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PaiementLocationService } from './paiement_location.service';
import { CreatePaiementLocationDto } from './dto/create-paiement_location.dto';
import { Paiementlocation } from './entities/paiement_location.entity';
import { ApiResponse,ApiTags,ApiOperation } from '@nestjs/swagger';

@ApiTags('Paiement-location')
@Controller('paiement-location')
export class PaiementLocationController {
  constructor(private readonly paiementLocationService: PaiementLocationService) {}

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // async create(@Body() createPaiementLocationDto: CreatePaiementLocationDto): Promise<Paiementlocation> {
  //   return this.paiementLocationService.create(createPaiementLocationDto);
  // }

  @Get()
  @ApiOperation({summary:'Récupérer tous les paiement de location'})
  async findAll(): Promise<Paiementlocation[]> {
    return this.paiementLocationService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary:'Récupérer un seul paiement de location par son id'})
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Paiementlocation> {
    return this.paiementLocationService.findOne(id);
  }

  //   @Delete(':id')
  // remove(@Param('id') id: number) {
  //   return this.paiementLocationService.remove(+id);
  // }
}