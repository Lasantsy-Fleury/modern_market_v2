import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuiviService } from './suivi.service';
import { SuiviFiltresDto } from './dto/suivi-filtres.dto';

const PIPES = new ValidationPipe({ transform: true, whitelist: true });

@ApiTags('Suivi financier & opérationnel')
@Controller('suivi')
export class SuiviController {
  constructor(private readonly suiviService: SuiviService) {}

  @Get('indicateurs')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Indicateurs consolidés (recettes, situation, activité)' })
  async indicateurs(@Query() f: SuiviFiltresDto) {
    const [recettes, situation, activite] = await Promise.all([
      this.suiviService.getRecettesAgregat(f),
      this.suiviService.getSituationFinanciere(f),
      this.suiviService.getActivite(f),
    ]);
    return { recettes, situation, activite };
  }

  @Get('recettes')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Recettes du jour / du mois / annuelles' })
  recettes(@Query() f: SuiviFiltresDto) {
    return this.suiviService.getRecettesAgregat(f);
  }

  @Get('situation-financiere')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Attendu, encaissé, impayés, retards, partiels' })
  situation(@Query() f: SuiviFiltresDto) {
    return this.suiviService.getSituationFinanciere(f);
  }

  @Get('activite')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Commerçants, présences, contrôles, tickets, quittances' })
  activite(@Query() f: SuiviFiltresDto) {
    return this.suiviService.getActivite(f);
  }

  @Get('rapprochement')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Encaissements vs Paiements vs Quittances vs Recettes' })
  rapprochement(@Query() f: SuiviFiltresDto) {
    return this.suiviService.getRapprochement(f);
  }

  @Get('recettes/details')
  @UsePipes(PIPES)
  @ApiOperation({ summary: 'Détail paginé des recettes' })
  recettesDetails(@Query() f: SuiviFiltresDto) {
    return this.suiviService.getRecettesDetails(f);
  }
}
