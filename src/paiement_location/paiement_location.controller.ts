import { Controller, Get, Post, Body, Param, Delete, NotFoundException, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PaiementLocationService } from './paiement_location.service';
import { CreatePaiementLocationDto } from './dto/create-paiement_location.dto';
import { Paiementlocation } from './entities/paiement_location.entity';
@Controller('paiement-location')
export class PaiementLocationController {
  constructor(private readonly paiementLocationService: PaiementLocationService) {}

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // async create(@Body() createPaiementLocationDto: CreatePaiementLocationDto): Promise<Paiementlocation> {
  //   return this.paiementLocationService.create(createPaiementLocationDto);
  // }

  @Get()
  async findAll(): Promise<Paiementlocation[]> {
    return this.paiementLocationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Paiementlocation> {
    return this.paiementLocationService.findOne(id);
  }

  //   @Delete(':id')
  // remove(@Param('id') id: number) {
  //   return this.paiementLocationService.remove(+id);
  // }
}