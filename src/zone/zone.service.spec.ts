// import { Test, TestingModule } from '@nestjs/testing';
// import { HttpService } from '@nestjs/axios';
// import { AxiosResponse } from 'axios';
// import {
//   BadRequestException,
//   NotFoundException,
//   ServiceUnavailableException,
// } from '@nestjs/common';
// import { of, throwError } from 'rxjs';

// import { ZoneService } from './zone.service';

// describe('ZoneService', () => {
//   let service: ZoneService;
//   let httpService: HttpService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         ZoneService,
//         {
//           provide: HttpService,
//           useValue: {
//             get: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<ZoneService>(ZoneService);
//     httpService = module.get<HttpService>(HttpService);
//   });

//   describe('existingFokontany', () => {
//     it('devrait lever BadRequestException si l’ID est manquant', async () => {
//       await expect(
//         service.existingFokontany(''),
//       ).rejects.toThrow(BadRequestException);

//       expect(httpService.get).not.toHaveBeenCalled();
//     });

//     it('devrait retourner le Fokontany lorsqu’il existe', async () => {
//       const fokontany = {
//         id: '123',
//         name: 'Fokontany Test',
//       };
//       const mockResponse: AxiosResponse = {
//         data: fokontany,
//         status: 200,
//         statusText: 'OK',
//         headers: {},
//         config: {
//           headers: {},
//         },
//       };

//       jest.spyOn(httpService, 'get').mockReturnValue(
//         of(mockResponse),
//       );
//       const result = await service.existingFokontany('123');

//       expect(result).toEqual(fokontany);

//       expect(httpService.get).toHaveBeenCalledWith(
//         '${this.gatewayBaseUrl}/serviceterritoire-v2/fokotanys/123',
//       );
//     });

//     it('devrait lever NotFoundException pour un 404', async () => {
//       const error = {
//         response: {
//           status: 404,
//         },
//       };

//       jest.spyOn(httpService, 'get').mockReturnValue(
//         throwError(() => error),
//       );

//       await expect(
//         service.existingFokontany('123'),
//       ).rejects.toThrow(NotFoundException);
//     });

//     it('devrait lever BadRequestException pour un 400', async () => {
//       const error = {
//         response: {
//           status: 400,
//         },
//       };

//       jest.spyOn(httpService, 'get').mockReturnValue(
//         throwError(() => error),
//       );

//       await expect(
//         service.existingFokontany('123'),
//       ).rejects.toThrow(BadRequestException);
//     });

//     it('devrait lever ServiceUnavailableException en cas d’erreur réseau', async () => {
//       const error = new Error('Network error');

//       jest.spyOn(httpService, 'get').mockReturnValue(
//         throwError(() => error),
//       );

//       await expect(
//         service.existingFokontany('123'),
//       ).rejects.toThrow(ServiceUnavailableException);
//     });
//   });
// });