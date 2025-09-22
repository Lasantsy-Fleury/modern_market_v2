// src/paiement/paiement.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { Repository } from 'typeorm';
import { LocationService } from 'src/location/location.service';
import { Paiementlocation } from 'src/paiement_location/entities/paiement_location.entity';
import { PaiementLocationService } from 'src/paiement_location/paiement_location.service';
import { EventsGateway } from 'src/events/events.gateway';
@Injectable()
export class PaiementService {
  constructor(
    @InjectRepository(Paiement)
    private readonly paieRepository: Repository<Paiement>,
    private readonly locationService: LocationService,
    private readonly paiementLocationService: PaiementLocationService,
    private readonly eventsGateway: EventsGateway
  ) { }

  async create(createPaiementDto: CreatePaiementDto): Promise<any> { // <= MODIFICATION ici : le type de retour est `any`
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
      });

      const savedPaiement = await queryRunner.manager.save(newPaiement);

      if (savedPaiement){
      this.eventsGateway.server.emit('create paiement', savedPaiement);
      console.log("envoie");
    }

      const qrCodes: { id_paiement_location: string; qrCode: string }[] = []; // <= NOUVEAU CODE ici : Création du tableau de codes QR
      const createdPaiementLocations: Paiementlocation[] = []; // <= NOUVEAU CODE ici : Création du tableau pour les entités Paiementlocation

      if (savedPaiement.status === 'success') {
        const locationId = paiement_locations[0].locationId;
        await this.locationService.updateLocalStatusToRented(locationId);

        // <= NOUVEAU CODE ici : Boucle pour créer chaque paiement de location et récupérer le QR code
        for (const locDto of paiement_locations) {
          const { paiementLocation, qrCode } = await this.paiementLocationService.create(locDto, queryRunner);
          qrCodes.push({ id_paiement_location: paiementLocation.id_paiement_location, qrCode });
          createdPaiementLocations.push(paiementLocation);
        }
      }

      // <= NOUVEAU CODE ici : Associer les paiements de location au paiement principal
      savedPaiement.paiement_locations = createdPaiementLocations;
      await queryRunner.manager.save(savedPaiement);

      await queryRunner.commitTransaction();


      // <= MODIFICATION ici : La réponse contient maintenant le paiement et les codes QR
      return {
        message: 'Paiement créé avec succès.',
        paiement: savedPaiement,
        qrCodes: qrCodes,
      };

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
      // userId?: string;
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

    if (filters.reference) {
      query.andWhere('paiement.reference ILIKE :reference', {
        reference: `%${filters.reference}%`,
      });
    }

    if (filters.status) {
      query.andWhere('paiement.status = :status', { status: filters.status });
    }

    if (filters.zoneId) {
      query.andWhere('zone.id_zone = :zoneId', { zoneId: filters.zoneId });
    }

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

  async findHistoryByUser(id_user: string, municipalityId?: number, page: number = 1, limit: number = 10) {
    if (!id_user) {
      throw new BadRequestException('L\'ID de l\'utilisateur est obligatoire.');
    }

    const query = this.paieRepository
      .createQueryBuilder('paiement')
      .leftJoinAndSelect('paiement.paiement_locations', 'paiement_location')
      .leftJoinAndSelect('paiement_location.location', 'location')
      .leftJoinAndSelect('location.local', 'local')
      .leftJoinAndSelect('local.zone', 'zone')
      .where('location.id_user = :id_user', { id_user }); // Filtre par l'ID de l'utilisateur

    // Ajouter le filtre municipalityId seulement s'il est fourni
    if (municipalityId !== undefined) {
      query.andWhere('zone.municipalityId = :municipalityId', { municipalityId });
    }

    query
      .orderBy('paiement.date_creation', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    const message = municipalityId
      ? `Historique des paiements pour l'utilisateur ${id_user} dans la municipalité ${municipalityId}`
      : `Historique des paiements pour l'utilisateur ${id_user}`;

    return {
      message,
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
}