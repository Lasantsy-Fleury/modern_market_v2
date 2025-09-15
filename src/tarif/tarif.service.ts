import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarif } from './entities/tarif.entity';
import { CreateTarifDto } from './dto/create-tarif.dto';
import { UpdateTarifDto } from './dto/update-tarif.dto';

@Injectable()
export class TarifService {
  constructor(
    @InjectRepository(Tarif)
    private readonly tarifRepository: Repository<Tarif>,
  ) {}

  async create(createTarifDto: CreateTarifDto): Promise<Tarif> {
    try {
      const newTarif = this.tarifRepository.create(createTarifDto);
      return await this.tarifRepository.save(newTarif);
    } catch (error) {
      throw new BadRequestException('Erreur lors de la création du tarif: ' + error.message);
    }
  }

  async findAll(): Promise<Tarif[]> {
    return await this.tarifRepository.find({
      relations: ['typelocal', 'zone'],
    });
  }

  async findOne(id: string): Promise<Tarif> {
    const tarif = await this.tarifRepository.findOne({
      where: { id_tarif: id },
      relations: ['typelocal', 'zone'],
    });

    if (!tarif) {
      throw new NotFoundException(`Tarif avec l'ID "${id}" introuvable`);
    }

    return tarif;
  }

  async update(id: string, updateTarifDto: UpdateTarifDto): Promise<Tarif> {
    const tarif = await this.findOne(id);

    Object.assign(tarif, updateTarifDto);

    return await this.tarifRepository.save(tarif);
  }

   async remove(id: string): Promise<{ message: string }> {
    const tarif = await this.findOne(id);

    await this.tarifRepository.remove(tarif);

    return { message: `Tarif avec l'ID "${id}" supprimé avec succès` };
  }
}
