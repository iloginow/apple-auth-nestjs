import { HttpService } from '@nestjs/axios';
import { AppleJwtPayload } from './types/apple-jwt-payload.type';
export declare class AppleAuthService {
    private httpService;
    constructor(httpService: HttpService);
    ValidateTokenAndDecode(token: string): Promise<AppleJwtPayload>;
    private getAppleAuthKeys;
}
