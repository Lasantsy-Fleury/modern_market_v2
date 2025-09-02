import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepository:
    Repository<Notification>,
    private readonly httpService: HttpService,
  ){}

  async create(createNotificationDto: CreateNotificationDto) {
    const notif = this.notifRepository.create(createNotificationDto);
    const savenotif = await this.notifRepository.save(notif)

    const payload = {
      to: createNotificationDto.to,
      subject: createNotificationDto.subject,
      body: createNotificationDto.body,
      // filePath: createNotificationDto.filePath ?? null,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://gateway.tsirylab.com/servicenotification/email/send',
          payload,
          { headers: { 'Content-Type': 'application/json' } },
        ),
      );
      console.log('Email API response:', response.data);
      console.log('Payload envoyé à l’API email:', payload);

    } catch (error) {
      console.error('Erreur envoi email:', error.message);
    }
    return savenotif ;
  }

  async findAll(
  page: number = 1,
  limit: number = 10,
  search?: string,
) {
  const query = this.notifRepository.createQueryBuilder('notif');

  // 🔎 Recherche seulement si "search" est fourni
  if (search) {
    query.where('notif.type ILIKE :search OR notif.paiementId::text ILIKE :search', {
      search: `%${search}%`,
    });
  }

  // 📌 Pagination (par défaut page=1, limit=10)
  query.skip((page - 1) * limit).take(limit);

  // 📌 Tri
  query.orderBy('notif.date_paiement', 'DESC');

  const [data, total] = await query.getManyAndCount();

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

  async findOne(id_notification: string) {
    return await this.notifRepository.findOne({
      where : {id_notification}
    });
  }

  async update(id_paiement_location: string, updateNotificationDto: UpdateNotificationDto) {
    const notif = await this.findOne(id_paiement_location);
    if(!notif) {
      throw new NotFoundException()
    }
    Object.assign(notif,updateNotificationDto)
    return await this.notifRepository.save(notif)
  }

  async remove(id_paiement_location: string) {
    const notif = await this.findOne(id_paiement_location);
    if(!notif) {
      throw new NotFoundException()
    }
    return await this.notifRepository.remove(notif)
  }
}
