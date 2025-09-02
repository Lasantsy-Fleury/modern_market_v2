import { ApiProperty } from "@nestjs/swagger";

export class CreateNotificationDto {
    @ApiProperty()
    type : string ;

    @ApiProperty()
    date_paiement: Date;

    @ApiProperty()
    paiementId: number
  // filePath: null;
  body: "Si tu lis ce mail, c’est que ça marche 🚀";
  subject: "Test NestJS";
  to: "jaoninasissiethephanie@gmail.com";
}
