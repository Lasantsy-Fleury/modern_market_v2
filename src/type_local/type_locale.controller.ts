import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, NotFoundException, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiResponse,ApiTags,ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Typelocal } from './entities/type_locale.entity';
import { TypeLocalService } from './type_locale.service';
import { CreateTypeLocalDto } from './dto/create-type_locale.dto';

@ApiTags('Type-Local')
@Controller('type-locals')
export class TypeLocalController {
  constructor(private readonly typeLocalService: TypeLocalService) {}

  @Post()
  @ApiOperation({summary:'Créer un type de local'})
  // @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {

  //       municipalityId: { type: "number" },
  //       typeLoc: { type: "string" },
  //       tarif: { type: "number" },
  //       description: { type: "string" },
  //       type_contrat: { type: "string" }
  //     },
  //     required: ['typeLoc', 'tarif'] 
  //   }
  // })
  @ApiResponse({ status: 201, description: 'Type local created successfully', type: Typelocal })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(
    @Body() createTypeLocalDto: CreateTypeLocalDto) {
    return this.typeLocalService.create(createTypeLocalDto);
  }

@Get('municipalityId/:municipalityId')
@ApiOperation({ summary: 'Récupérer tous les type local existant' })
@ApiQuery({ name: 'lang', required: false, type: String, description: 'Langue de la réponse (par défaut mg)' })
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de la page (par défaut 1)' })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de résultats par page (par défaut 10)' })
async findAll(
  @Param('municipalityId') municipalityId: string, // UUID string
  @Query('lang') lang: 'mg' | 'fr' = 'mg',
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
) {
  return this.typeLocalService.findAll(municipalityId, lang, page, limit);
}

  @Get('municipalityId/:municipalityId/id/:id')
  @ApiOperation({summary:'Récupérer un type local par son id'})
  findOne(@Param('municipalityId') municipalityId: string, @Param('id') id: string) {
    return this.typeLocalService.findOne(municipalityId, id);
  }

  @Patch('municipalityId/:municipalityId/id/:id')
  @ApiOperation({summary:'Modifier un type local'})
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        typeLoc: {
          type: 'object',
          properties: {
            mg: { type: 'string' },
            fr: { type: 'string' },
          },
        },
        description: {
          type: 'object',
          properties: {
            mg: { type: 'string' },
            fr: { type: 'string' },
          },
        },
        tarif: { type: 'number' },
        type_contrat: { type: 'enum', enum: ['JOURNALIER', 'ANNUEL'], default: 'ANNUEL' },
      },
      // You can remove the 'required' array because all fields are optional for a PATCH request
      // required: ['typeLoc', 'tarif']
    }
})
  @ApiResponse({ status: 201, description: 'Type local update successfully', type: Typelocal })
  @ApiResponse({ status: 404, description: 'Données non touver' })
  async update(
    @Param('municipalityId') municipalityId: string,
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateTypeLocalDto>,
  ) {
    return this.typeLocalService.update(municipalityId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({summary:'Supprimer un type local'})
  async remove(@Param('municipalityId') municipalityId: string, @Param('id') id: string) : Promise< { message : string , status : number , data : any }> {
    const type = await this.typeLocalService.remove(municipalityId, id);
    if ( type.status === 404 ) {
      throw new NotFoundException(type.message);
    }
    return type;
  }

}

// Traduction utilitaire
function translateType(type: string, lang: 'mg' | 'fr'): string {
  const translations = {
    magasin: { mg: 'fivarotana', fr: 'magasin' },
    restaurant: { mg: 'trano fisakafoanana', fr: 'restaurant' },
    // Ajoutez d’autres types ici
  };
  return translations[type]?.[lang] || type;
}

