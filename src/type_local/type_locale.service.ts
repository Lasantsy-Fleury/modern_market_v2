import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTypeLocalDto } from './dto/create-type_locale.dto';
import { Typelocal } from './entities/type_locale.entity';

@Injectable()
export class TypeLocalService {
  repo: any;
  constructor(
    @InjectRepository(Typelocal)
    private readonly typeLocalRepository: Repository<Typelocal>,
  ) {}

  async create(createTypeLocalDto: CreateTypeLocalDto): Promise<Typelocal> {
    if (!createTypeLocalDto) {
      throw new BadRequestException('CreateTypeLocalDto is required');
    }

    console.log('Received DTO:', createTypeLocalDto);

    if (!createTypeLocalDto.typeLoc) {
      throw new BadRequestException('typeLoc is required');
    }
    
    const typeLocal = this.typeLocalRepository.create(createTypeLocalDto);
    return await this.typeLocalRepository.save(typeLocal);
  }

  async findAll(lang: 'mg' | 'fr',page: number = 1,limit: number = 10 ): Promise<{
    message: string;
    data: any[];
    pagination: { total: number; page: number; limit: number; totalPagination: number };
    status: number;
  }> {
    const [result, total] = await this.typeLocalRepository.findAndCount({
    order: { id_type_local: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  const data = result.map(item => {
    if (lang === 'fr') {
      return {
        ...item,
        name: {
          mg: item.name.mg,
          fr: item.name.fr,
        },
        typeLoc: item.typeLoc,
      };
    }
    return item;
  });

  return {
    message: 'Liste des types locaux',
    data,
    pagination: {
      total,
      page,
      limit,
      totalPagination: Math.ceil(total / limit),
    },
    status: 200,
  };
  }

  async findOne(id_type_local: string): Promise<Typelocal> {
    const typeLocal = await this.typeLocalRepository.findOne({
      where: { id_type_local: id_type_local },
      relations: ['locaux'],
    });
    if (!typeLocal) {
      throw new NotFoundException(`TypeLocal with id ${id_type_local} not found`);
    }
    return typeLocal;
  }

  async update(id_type_local: string, updateDto: Partial<CreateTypeLocalDto>): Promise<Typelocal> {
    const typeLocal = await this.findOne(id_type_local);
    Object.assign(typeLocal, updateDto);
    return await this.typeLocalRepository.save(typeLocal);
  }

  async remove(id: string): Promise<{ message: string; status: number; data: any }> {
  const type = await this.typeLocalRepository.findOne({ where: { id_type_local: id } });
  if (!type) {
    return { message: 'Type local introuvable', status: 404, data: null };
  }

  await this.typeLocalRepository.remove(type);
  return { message: 'Type local supprimé avec succès', status: 200, data: type };
}

}
