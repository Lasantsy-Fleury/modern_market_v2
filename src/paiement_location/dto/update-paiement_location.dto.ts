import { PartialType } from '@nestjs/swagger';
import { CreatePaiementLocationDto } from './create-paiement_location.dto';

export class UpdatePaiementLocationDto extends PartialType(CreatePaiementLocationDto) {}
