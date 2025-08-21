import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDistributionTicketDto } from './dto/create-distribution_ticket.dto';
import { UpdateDistributionTicketDto } from './dto/update-distribution_ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DistributionTicket } from './entities/distribution_ticket.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DistributionTicketService {
  constructor(
    @InjectRepository(DistributionTicket)
    private readonly distRepository :
    Repository <DistributionTicket>
  ){}

  async create(createDistributionTicketDto: CreateDistributionTicketDto) {
    const dist =this.distRepository.create(createDistributionTicketDto);
    return await this.distRepository.save(dist);
  }

  async findAll() {
    return await this.distRepository.find();
  }

  async findOne(id_distribution_ticket: number) {
    return await this.distRepository.findOne({
      where : {id_distribution_ticket}
    });
  }

  async update(id_distribution_ticket: number, updateDistributionTicketDto: UpdateDistributionTicketDto) {
    const dist = await this.findOne(id_distribution_ticket);
    if(!dist) {
      throw new NotFoundException(`Distribustion recus with ID ${id_distribution_ticket} not found`);
      }
    Object.assign(dist ,updateDistributionTicketDto);
    return await this.distRepository.save(dist);
  }

  async remove(id_distribution_ticket: number) {
  const dist = await this.findOne(id_distribution_ticket);
  if(!dist) {
    throw new NotFoundException();
  }
    return await this.distRepository.remove(dist);
  }
}
