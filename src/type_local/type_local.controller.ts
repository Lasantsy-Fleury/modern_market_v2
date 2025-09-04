import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TypeLocalService } from './type_local.service';
import { CreateTypeLocalDto } from './dto/create-type_local.dto';
import { ApiResponse,ApiTags,ApiOperation } from '@nestjs/swagger';

@ApiTags('Type-Local')
@Controller('type-locals')
export class TypeLocalController {
  constructor(private readonly typeLocalService: TypeLocalService) {}

  @Post()
  @ApiOperation({summary:'Créer un type de local'})
  create(@Body() createTypeLocalDto: CreateTypeLocalDto) {
    return this.typeLocalService.create(createTypeLocalDto);
  }

  @Get()
  @ApiOperation({summary:'Récupérer tous les type local existant'})
  findAll() {
    return this.typeLocalService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary:'Récupérer un type local par son id'})
  findOne(@Param('id') id: number) {
    return this.typeLocalService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({summary:'Modifier un type local'})
  update(
    @Param('id') id: number,
    @Body() updateDto: Partial<CreateTypeLocalDto>,
  ) {
    return this.typeLocalService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({summary:'Supprimer untype local'})
  remove(@Param('id') id: number) {
    return this.typeLocalService.remove(+id);
  }
}
