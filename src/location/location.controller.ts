import { Controller, Get, Post, Body, Patch, Param, Res, NotFoundException } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import * as QRCode from 'qrcode';
import { Response } from 'express';
import { ApiResponse,ApiTags,ApiOperation } from '@nestjs/swagger';


@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @Post()
  @ApiOperation({summary:'Créer un nouvelle location'})
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({summary:'Récupérer toutes les locations'})
  findAll() {
    return this.locationService.findAll();
  }


  @Get('en_cours')
  @ApiOperation({summary:'Récupérer tous les locations en cours'})
  findAllInProgress() {
    return this.locationService.findAllInProgress();
  }

  // Toutes les locations d'un utilisateur
  @Get('userLocations/:id_user')
  @ApiOperation({summary:'Récupérer toutes les locations d un user en cours ou pas'})
  findByUser(@Param('id_user') id_user: string) {
    return this.locationService.findByUser(id_user);
  }

  // Locations en cours d'un utilisateur
  @Get('userLocations/:id_user/en_cours')
  @ApiOperation({summary:'Récupérer toutes les locations d un user en cours seulement'})
  findInProgressByUser(@Param('id_user') id_user: string) {
    return this.locationService.findInProgressByUser(id_user);
  }

  @Get(':id')
  @ApiOperation({summary:'Récupérer une location par son id'})
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Get('locationQrCode/:id')
  @ApiOperation({summary:'Récupérer le qr Code contenant les infos d une location par son id-location '})
  async findOneWithQrcode(@Param('id') id: string, @Res() res: Response) {
    const location = await this.locationService.findLocationWithPaymentDates(id);
    if (!location) {
      throw new NotFoundException('Location not found.');
    }

    // Convert the data into a JSON string for encoding.
    // We'll only include relevant fields to keep the QR code simple.
    const locationData = {
      id: location.id_location,
      tarif: location.tarif,
      periodicite: location.periodicite,
      date_debut: location.date_debut_loc,
      date_fin: location.date_fin_loc,
      frequence: location.frequence,
    };
    const jsonString = JSON.stringify(locationData);

    try {
      // Generate the QR code as a PNG image buffer.
      const qrCodeBuffer = await QRCode.toBuffer(jsonString, { type: 'png' });

      // Set headers to tell the browser it's an image.
      res.setHeader('Content-Type', 'image/png');

      // Send the image buffer.
      res.send(qrCodeBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error generating QR code.');
    }
  }

  @Patch(':id')
  @ApiOperation({summary:'Modification d une location par son id'})
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateLocationDto>) {
    return this.locationService.update(id, updateDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.locationService.remove(id);
  // }
}
