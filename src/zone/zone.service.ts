import {
  Injectable, NotFoundException, BadRequestException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Zone } from './entities/zone.entity';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse, AxiosError  } from 'axios';

@Injectable()
export class ZoneService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
    private readonly httpService: HttpService,
  ) { }

  async existingFokontany(fokotanyId: number) {
    if (!fokotanyId) {
      throw new BadRequestException(`Fokontany Id manquant.`);
    }

    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `https://gateway.tsirylab.com/serviceterritoire/fokotanys/${fokotanyId}`,
        ),
      );

      if (!response.data) {
        throw new NotFoundException(
          `Fokontany avec l' id '${fokotanyId}' n'existe pas`,
        );
      }

      return response.data;
    } catch (error) {
      // Erreur côté API externe
      if (error.response?.status === 404) {
        throw new NotFoundException(
          `Fokontany with id '${fokotanyId}' not found in gateway`,
        );
      }
      if (error.response?.status === 400) {
        throw new BadRequestException(
          `Invalid Fokontany ID '${fokotanyId}' provided`,
        );
      }

      // Erreur générique (API down ou problème réseau)
      throw new ServiceUnavailableException(
        `Unable to reach the gateway service for fokontany validation`,
      );
    }
  }

  async create(createZoneDto: CreateZoneDto) {

    // Vérifier que la fokontany existe dans le service externe
    const fokontany = await this.existingFokontany(createZoneDto.fokotany_id);

    const municipalityId = fokontany?.commune?.commune_id;

    if (!municipalityId) {
      throw new NotFoundException(
        `Municipality not found for fokontany ${createZoneDto.fokotany_id}`,
      );
    }
    const existingZone = await this.zoneRepository.findOne({
      where: {
        nom: createZoneDto.nom,
        fokotany_id: createZoneDto.fokotany_id,
      },
    });

    if (existingZone) {
      throw new ConflictException(
        `Zone with id '${createZoneDto.nom}' already exists in municipality ${createZoneDto.fokotany_id}`,
      );
    }
    try {
      const zone = this.zoneRepository.create({
        ...createZoneDto,
        municipalityId,
      });
      return await this.zoneRepository.save(zone);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create zone. Please check your input data.`,
      );
    }
  }

  // Retourner toutes les zones d’une municipalité
async findAll(municipalityId: number, limit: number, page: number) {
  try {
    const url = `https://gateway.tsirylab.com/serviceterritoire/communes/${municipalityId}`;
    const response = await firstValueFrom(
      this.httpService.get(url, { headers: { accept: 'application/json' } })
    );

    // response.data est sûr ici
    const [result, total] = await this.zoneRepository.findAndCount({
      where: { municipalityId },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      message: 'Liste de service',
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      status: 200,
    };
  } catch (error) {
    // Vérifier si l'erreur vient de l'API (404)
    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new NotFoundException(`Municipality with id ${municipalityId} not found`);
    }

    // Toute autre erreur
    throw new ServiceUnavailableException(
      'Impossible de récupérer les zones pour le moment. Veuillez réessayer plus tard.',
    );
  }
}
  // Trouver une zone par son nom ou autre filtre limité à la municipalité
  async findOne(municipalityId: number, id_zone: string) {
    try {
      const url = `https://gateway.tsirylab.com/serviceterritoire/communes/${municipalityId}`;
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: { accept: 'application/json' } })
      );

    
      const zone = await this.zoneRepository.findOne({
        where: { municipalityId, id_zone },
      });

      if (!zone) {
        throw new NotFoundException(
          `Zone avec id '${id_zone}' introuvable dans la municipalité ${municipalityId}`,
        );
      }
      return zone;
    } catch (error) {
       // Vérifier si l'erreur vient de l'API (404)
    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new NotFoundException(`Municipality with id ${municipalityId} not found`);
    }

    // Toute autre erreur
    throw new ServiceUnavailableException(
      'Impossible de récupérer les zones pour le moment. Veuillez réessayer plus tard.',
    );
    }
  }

  async searchByName(municipalityId: number, keyword: string): Promise<Zone[]> {
    if (!keyword) {
      throw new BadRequestException('Le mot-clé de recherche est requis');
    }
    const url = `https://gateway.tsirylab.com/serviceterritoire/communes/${municipalityId}`;
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: { accept: 'application/json' } })
      );

      if (!response.data) {
        throw new NotFoundException(`Municipality with id ${municipalityId} not found`);
      }

    try {

      return await this.zoneRepository.find({
        where: {
          municipalityId,
          nom: ILike(`%${keyword}%`), // insensible à la casse
        },
      });
    } catch (error) {
       // Vérifier si l'erreur vient de l'API (404)
    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new NotFoundException(`Municipality with id ${municipalityId} not found`);
    }

    // Toute autre erreur
    throw new ServiceUnavailableException(
      'Impossible de récupérer les zones pour le moment. Veuillez réessayer plus tard.',
    );
    }
  }

  // Mettre à jour une zone via son nom et la municipalité
  async update(
    municipalityId: number,
    id_zone: string,
    updateZoneDto: UpdateZoneDto,
  ) {
    const url = `https://gateway.tsirylab.com/serviceterritoire/communes/${municipalityId}`;
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: { accept: 'application/json' } })
      );

      if (!response.data) {
        throw new NotFoundException(`Municipality with id ${municipalityId} not found`);
      }

    try {
      const zone = await this.findOne(municipalityId, id_zone);

      Object.assign(zone, updateZoneDto);

      return await this.zoneRepository.save(zone);
    } catch (error) {
       // Vérifier si l'erreur vient de l'API (404)
    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new NotFoundException(`Municipality with id ${municipalityId} not found`);
    }

    // Toute autre erreur
    throw new ServiceUnavailableException(
      'Impossible de mettre a jour  les zones pour le moment. Veuillez réessayer plus tard.',
    );
    }
  }
  // Supprimer une zone via son nom et la municipalité
  async remove(municipalityId: number, id_zone: string) {
    const zone = await this.findOne(municipalityId, id_zone);
    return await this.zoneRepository.remove(zone);
  }
}
