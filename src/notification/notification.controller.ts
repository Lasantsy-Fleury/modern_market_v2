import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { number, string, StringSchema } from 'joi';
import { ApiResponse,ApiTags,ApiOperation } from '@nestjs/swagger';


@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({summary:'Créer une nouvelle not'})
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({summary:'Récupérer tous les notifications'})
  findAll(
    @Param('page') page: number,
    @Param('limit') limit: number,
    @Param('search') search?: string,)
  {
    return this.notificationService.findAll(
    page ? Number(page) : undefined,   // défaut = 1
    limit ? Number(limit) : undefined, // défaut = 10
    search || undefined,
    );
  }

  @Get(':id')
  @ApiOperation({summary:'Récupérer une notifcation par son id'})
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({summary:'Modifier une notifcation par son id'})
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  @ApiOperation({summary:'Supprimer une notification'})
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
function findOne(arg0: any, id: any, string: <TSchema = string>() => StringSchema<TSchema>) {
  throw new Error('Function not implemented.');
}

