import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaiementService {
  constructor(
    @InjectRepository(Paiement)
    private readonly paieRepository :
    Repository<Paiement>
  ){}

  async create(createPaiementDto: CreatePaiementDto) {
    const paiement = this.paieRepository.create(createPaiementDto)
    return await this.paieRepository.save(paiement)

  }

  async findAll() {
    return await this.paieRepository.find();
  }

  async findOne(id_paiement: string) {
    return await this.paieRepository.findOne({ 
      where : {id_paiement:id_paiement}
    });
  }

  // update(id: number, updatePaiementDto: UpdatePaiementDto) {
  //   return `This action updates a #${id} paiement`;
  // }

  async remove(id_paiement: string) {
    const paiement = await this.findOne(id_paiement);
    if(!paiement){
      throw new NotFoundException();
    }
    return await this.paieRepository.remove(paiement)
  }
}
