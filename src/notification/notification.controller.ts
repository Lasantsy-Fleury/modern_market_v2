import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { number, string, StringSchema } from 'joi';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
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
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
function findOne(arg0: any, id: any, string: <TSchema = string>() => StringSchema<TSchema>) {
  throw new Error('Function not implemented.');
}

