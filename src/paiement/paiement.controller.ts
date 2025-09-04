import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaiementService } from './paiement.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { UpdatePaiementDto } from './dto/update-paiement.dto';
import { ApiResponse,ApiTags,ApiOperation } from '@nestjs/swagger';


@ApiTags('Paiement')
@Controller('paiement')
export class PaiementController {
  constructor(private readonly paiementService: PaiementService) {}

  @Post()
  @ApiOperation({summary:'Enregistrer le paiement d un contribuable'})
  create(@Body() createPaiementDto: CreatePaiementDto) {
    return this.paiementService.create(createPaiementDto);
  }

  @Get()
  @ApiOperation({summary:'Récupérer tous les paiements enregistrés'})
  findAll() {
    return this.paiementService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary:'Récupérer un paiement par son id'})
  findOne(@Param('id') id: string) {
    return this.paiementService.findOne(id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.paiementService.remove(id);
  // }
}
