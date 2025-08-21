import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DistributionTicketService } from './distribution_ticket.service';
import { CreateDistributionTicketDto } from './dto/create-distribution_ticket.dto';
import { UpdateDistributionTicketDto } from './dto/update-distribution_ticket.dto';

@Controller('servicemarche/distribution-ticket')
export class DistributionTicketController {
  constructor(private readonly distributionTicketService: DistributionTicketService) {}

  @Post()
  create(@Body() createDistributionTicketDto: CreateDistributionTicketDto) {
    return this.distributionTicketService.create(createDistributionTicketDto);
  }

  @Get()
  findAll() {
    return this.distributionTicketService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.distributionTicketService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDistributionTicketDto: UpdateDistributionTicketDto) {
    return this.distributionTicketService.update(+id, updateDistributionTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.distributionTicketService.remove(+id);
  }
}
