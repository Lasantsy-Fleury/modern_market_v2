import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TypeLocalService } from './type_local.service';
import { CreateTypeLocalDto } from './dto/create-type_local.dto';
import { UpdateTypeLocalDto } from './dto/update-type_local.dto';

@Controller('type-local')
export class TypeLocalController {
  constructor(private readonly typeLocalService: TypeLocalService) {}

  @Post()
  create(@Body() createTypeLocalDto: CreateTypeLocalDto) {
    return this.typeLocalService.create(createTypeLocalDto);
  }

  @Get()
  findAll() {
    return this.typeLocalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeLocalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTypeLocalDto: UpdateTypeLocalDto) {
    return this.typeLocalService.update(+id, updateTypeLocalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeLocalService.remove(+id);
  }
}
