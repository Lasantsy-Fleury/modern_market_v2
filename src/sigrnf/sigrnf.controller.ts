import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SigrnfService } from './sigrnf.service';

@ApiTags('SIGRNF Integration')
@Controller('sigrnf')
export class SigrnfController {
  constructor(private readonly sigrnfService: SigrnfService) {}

  @Get('status')
  @ApiOperation({
    summary:
      "Statut de l'intégration SIGRNF (activée / configurée) - aucun secret exposé",
  })
  @ApiResponse({
    status: 200,
    description:
      'Statut de l intégration. Ne retourne ni clé API, ni jeton, ni URL privée.',
    schema: {
      example: { enabled: false, configured: false },
    },
  })
  getStatus() {
    return this.sigrnfService.getStatus();
  }
}
