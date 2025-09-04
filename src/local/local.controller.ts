import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocalService } from './local.service';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { ApiBody, ApiResponse,ApiTags,ApiOperation } from '@nestjs/swagger';

@ApiTags('Local')
@Controller('local')
export class LocalController {
  constructor(private readonly localService: LocalService) {}

  @Post()
  @ApiOperation({summary:'RCréer un nouveau local'})
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

  @Get()
  @ApiOperation({summary:'RCréer un nouveau local'})
  findAll() {
    return this.localService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary:'RCréer un nouveau local'})
  findOne(@Param('id') id: string) {
    return this.localService.findOne(id);
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
