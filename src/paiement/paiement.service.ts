import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { Repository } from 'typeorm';
import { LocationService } from 'src/location/location.service';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';

@Injectable()
export class PaiementService {
  constructor(
    @InjectRepository(Paiement)
    private readonly paieRepository: Repository<Paiement>,
    private readonly locationService: LocationService,
  ) {}

  async create(createPaiementDto: CreatePaiementDto): Promise<Paiement> {
    const queryRunner = this.paieRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { paiement_locations, ...paiementData } = createPaiementDto;

      if (!paiement_locations || paiement_locations.length === 0) {
        throw new BadRequestException('Au moins une location doit être associée au paiement.');
      }

      const newPaiement = this.paieRepository.create({
        ...paiementData,
        paiement_locations: paiement_locations.map(locDto => {
          const pl = new Paiementlocation();
          pl.locationId = locDto.locationId;
          pl.nombre_paye = locDto.nombre_paye;
          pl.montant_paye = locDto.montant_paye;
          return pl;
        }),
      });

      const savedPaiement = await queryRunner.manager.save(newPaiement);

      if (savedPaiement.status === 'success') {
        const locationId = paiement_locations[0].locationId;
        await this.locationService.updateLocalStatusToRented(locationId);
      }

      await queryRunner.commitTransaction();
      return savedPaiement;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Échec de création du paiement : ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    municipalityId: number,
    filters: {
      reference?: string;
      status?: 'success' | 'failed';
      zoneId?: string;
      startDate?: string;
      endDate?: string;
    },
    page = 1,
    limit = 10,
  ) {
    if (!municipalityId) {
      throw new BadRequestException('Le municipalityId est obligatoire.');
    }

    const query = this.paieRepository
      .createQueryBuilder('paiement')
      .leftJoinAndSelect('paiement.paiement_locations', 'paiement_location')
      .leftJoinAndSelect('paiement_location.location', 'location')
      .leftJoinAndSelect('location.local', 'local')
      .leftJoinAndSelect('local.zone', 'zone')
      .where('zone.municipalityId = :municipalityId', { municipalityId }); // Filtre obligatoire

    // Filtre sur la référence
    if (filters.reference) {
      query.andWhere('paiement.reference ILIKE :reference', {
        reference: `%${filters.reference}%`,
      });
    }

    // Filtre sur le status
    if (filters.status) {
      query.andWhere('paiement.status = :status', { status: filters.status });
    }

    // Filtre sur zoneId
    if (filters.zoneId) {
      query.andWhere('zone.id_zone = :zoneId', { zoneId: filters.zoneId });
    }

    // Filtre sur date de création
    if (filters.startDate) {
      query.andWhere('paiement.date_creation >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('paiement.date_creation <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // Pagination et ordre
    query.skip((page - 1) * limit).take(limit).orderBy('paiement.date_creation', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      message: 'Liste des paiements filtrés',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      status: 200,
    };
  }

  async findOne(id_paiement: string, municipalityId: number) {
    if (!municipalityId) {
      throw new BadRequestException('Le municipalityId est obligatoire.');
    }

    const paiement = await this.paieRepository
      .createQueryBuilder('paiement')
      .leftJoinAndSelect('paiement.paiement_locations', 'paiement_location')
      .leftJoinAndSelect('paiement_location.location', 'location')
      .leftJoinAndSelect('location.local', 'local')
      .leftJoinAndSelect('local.zone', 'zone')
      .where('paiement.id_paiement = :id_paiement', { id_paiement })
      .andWhere('zone.municipalityId = :municipalityId', { municipalityId })
      .getOne();

    if (!paiement) {
      throw new NotFoundException(`Paiement with ID "${id_paiement}" not found for municipality ${municipalityId}.`);
    }

    return paiement;
  }
}