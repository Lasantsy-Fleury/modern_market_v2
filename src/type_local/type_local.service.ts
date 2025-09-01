import { Injectable } from '@nestjs/common';
import { CreateTypeLocalDto } from './dto/create-type_local.dto';
import { UpdateTypeLocalDto } from './dto/update-type_local.dto';

@Injectable()
export class TypeLocalService {
  create(createTypeLocalDto: CreateTypeLocalDto) {
    return 'This action adds a new typeLocal';
  }

  findAll() {
    return `This action returns all typeLocal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} typeLocal`;
  }

  update(id: number, updateTypeLocalDto: UpdateTypeLocalDto) {
    return `This action updates a #${id} typeLocal`;
  }

  remove(id: number) {
    return `This action removes a #${id} typeLocal`;
  }
}
