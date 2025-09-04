import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { Repository } from 'typeorm';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';
import { Location, } from 'src/location/entities/location.entity';
import { PaiementLocationService } from 'src/paiement_location/paiement_location.service';
@Injectable()
export class PaiementService {
  constructor(
    @InjectRepository(Paiement)
    private readonly paieRepository:
      Repository<Paiement>,
    private readonly paiementlocationService: PaiementLocationService,

  ) { }

  async create(createPaiementDto: CreatePaiementDto): Promise<Paiement> {
    const queryRunner = this.paieRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { paiement_locations, ...paiementData } = createPaiementDto;

      const newPaiement = this.paieRepository.create(paiementData);
      const savedPaiement = await queryRunner.manager.save(newPaiement);

      if (paiement_locations && paiement_locations.length > 0) {
        for (const locDto of paiement_locations) {
          locDto.paiementId = savedPaiement.id_paiement;
          
          // Pass the queryRunner to the service
          await this.paiementlocationService.create(locDto, queryRunner);
        }
      }

      await queryRunner.commitTransaction();
      return savedPaiement;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Failed to create paiement and associated locations: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }



  async findAll() {
    return await this.paieRepository.find();
  }

  async findOne(id_paiement: string) {
    return await this.paieRepository.findOne({
      where: { id_paiement: id_paiement }
    });
  }



  async remove(id_paiement: string) {
    const paiement = await this.findOne(id_paiement);
    if (!paiement) {
      throw new NotFoundException();
    }
    return await this.paieRepository.remove(paiement)
  }
}
