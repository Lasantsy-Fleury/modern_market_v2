import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Typelocal } from './entities/type_local.entity';
import { CreateTypeLocalDto } from './dto/create-type_local.dto';
@Injectable()
export class TypeLocalService {
  constructor(
    @InjectRepository(Typelocal)
    private readonly typeLocalRepository: Repository<Typelocal>,
  ) {}

  async create(createTypeLocalDto: CreateTypeLocalDto): Promise<Typelocal> {
    const existingTypeLocal = await this.typeLocalRepository.findOne({
      where: { type: createTypeLocalDto.type },
    });
    if (existingTypeLocal) {
      throw new NotFoundException(`TypeLocal with name ${createTypeLocalDto.type} already exists`);
    }
    const typeLocal = this.typeLocalRepository.create(createTypeLocalDto);
    return await this.typeLocalRepository.save(typeLocal);
  }

  async findAll(): Promise<Typelocal[]> {
    return await this.typeLocalRepository.find({ relations: ['locaux'] });
  }

  async findOne(id: number): Promise<Typelocal> {
    const typeLocal = await this.typeLocalRepository.findOne({
      where: { id_type_local: id },
      relations: ['locaux'],
    });
    if (!typeLocal) {
      throw new NotFoundException(`TypeLocal with id ${id} not found`);
    }
    return typeLocal;
  }

  async update(id: number, updateDto: Partial<CreateTypeLocalDto>): Promise<Typelocal> {
    const typeLocal = await this.findOne(id);
    Object.assign(typeLocal, updateDto);
    return await this.typeLocalRepository.save(typeLocal);
  }

  async remove(id: number): Promise<void> {
    const typeLocal = await this.findOne(id);
    await this.typeLocalRepository.remove(typeLocal);
  }
}
