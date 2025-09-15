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

    // Vérification manuelle (optionnelle) avant sauvegarde
    const existingRef = await this.paieRepository.findOne({
      where: { reference: paiementData.reference },
    });
    if (existingRef) {
      throw new BadRequestException(
        `Un paiement avec la référence "${paiementData.reference}" existe déjà.`,
      );
    }

    const existingPaiementId = await this.paieRepository.findOne({
      where: { paiementId: paiementData.paiementId },
    });
    if (existingPaiementId) {
      throw new BadRequestException(
        `Un paiement avec l'ID "${paiementData.paiementId}" existe déjà.`,
      );
    }

    // Création du paiement
    const newPaiement = this.paieRepository.create(paiementData);
    const savedPaiement = await queryRunner.manager.save(newPaiement);

    // Gestion des paiements_location associés
    if (savedPaiement.status == 'success' && paiement_locations && paiement_locations.length > 0) {
      for (const locDto of paiement_locations) {
        locDto.paiementId = savedPaiement.id_paiement;
        await this.paiementlocationService.create(locDto, queryRunner);
      }
    }

    await queryRunner.commitTransaction();
    return savedPaiement;

  } catch (error) {
    await queryRunner.rollbackTransaction();

    // Gestion spécifique des erreurs de contrainte unique
    if (error.code === '23505') {
      if (error.detail.includes('reference')) {
        throw new BadRequestException(
          `La référence "${createPaiementDto.reference}" existe déjà.`,
        );
      }
      if (error.detail.includes('paiementId')) {
        throw new BadRequestException(
          `Le paiementId "${createPaiementDto.paiementId}" existe déjà.`,
        );
      }
    }

    // Autres erreurs génériques
    throw new BadRequestException(
      `Échec de création du paiement : ${error.message}`,
    );
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
