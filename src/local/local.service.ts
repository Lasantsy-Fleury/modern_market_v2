import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Local } from './entities/local.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocalService {
  constructor(
    @InjectRepository(Local)
    private readonly localRepository:
    Repository<Local>
  ){}
  
  async create(createLocalDto: CreateLocalDto) {
    const local = this.localRepository.create(createLocalDto);
    return await this.localRepository.save(local)
  }

  async findAll() {
    return await this.localRepository.find()
  }

  async findOne(id_local: string) {
    return await this.localRepository.findOne({
      where: {id_local : id_local}
    })
  }

  async update(id_local: string, updateLocalDto: UpdateLocalDto) {
    const local = await this.findOne(id_local);
    if (!local){
      throw new NotFoundException();
    }
    Object.assign(local , updateLocalDto);
    return await this.localRepository.save(local)
  }

  async remove(id_local: string) {
     const local = await this.findOne(id_local);
    if (!local){
      throw new NotFoundException();
    }
    return await this.localRepository.remove(local)
  }
}
