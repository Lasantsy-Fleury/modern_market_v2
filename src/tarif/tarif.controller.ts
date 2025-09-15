import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { TarifService } from './tarif.service';
import { CreateTarifDto } from './dto/create-tarif.dto';
import { UpdateTarifDto } from './dto/update-tarif.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Tarif } from './entities/tarif.entity';

@ApiTags('Tarifs')
@Controller('tarifs')
export class TarifController {
  constructor(private readonly tarifService: TarifService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau tarif' })
  async create(@Body() createTarifDto: CreateTarifDto): Promise<Tarif> {
    return this.tarifService.create(createTarifDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les tarifs' })
  async findAll(): Promise<Tarif[]> {
    return this.tarifService.findAll();
  }

  @Get('getOne/:id')
  @ApiOperation({ summary: 'Récupérer un tarif par son ID' })
  async findOne(@Param('id') id: string): Promise<Tarif> {
    return this.tarifService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un tarif par son ID' })
  async update(@Param('id') id: string, @Body() updateTarifDto: UpdateTarifDto): Promise<Tarif> {
    return this.tarifService.update(id, updateTarifDto);
  }

//  @Delete(':id')
//   @ApiOperation({ summary: 'Supprimer un tarif par son ID' })
//   async remove(@Param('id') id: string): Promise<{ message: string }> {
//     return this.tarifService.remove(id);
//   }
}
