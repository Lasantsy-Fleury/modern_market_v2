import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaiementLocationService } from './paiement_location.service';
import { CreatePaiementLocationDto } from './dto/create-paiement_location.dto';
import { UpdatePaiementLocationDto } from './dto/update-paiement_location.dto';

@Controller('paiement-location')
export class PaiementLocationController {
  constructor(private readonly paiementLocationService: PaiementLocationService) {}

  @Post()
  create(@Body() createPaiementLocationDto: CreatePaiementLocationDto) {
    return this.paiementLocationService.create(createPaiementLocationDto);
  }

  @Get()
  findAll() {
    return this.paiementLocationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paiementLocationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaiementLocationDto: UpdatePaiementLocationDto) {
    return this.paiementLocationService.update(+id, updatePaiementLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paiementLocationService.remove(+id);
  }
}
