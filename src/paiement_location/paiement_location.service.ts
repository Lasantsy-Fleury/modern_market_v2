import { Injectable } from '@nestjs/common';
import { CreatePaiementLocationDto } from './dto/create-paiement_location.dto';
import { UpdatePaiementLocationDto } from './dto/update-paiement_location.dto';

@Injectable()
export class PaiementLocationService {
  create(createPaiementLocationDto: CreatePaiementLocationDto) {
    return 'This action adds a new paiementLocation';
  }

  findAll() {
    return `This action returns all paiementLocation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paiementLocation`;
  }

  update(id: number, updatePaiementLocationDto: UpdatePaiementLocationDto) {
    return `This action updates a #${id} paiementLocation`;
  }

  remove(id: number) {
    return `This action removes a #${id} paiementLocation`;
  }
}
