import {
    InternalServerErrorException,
    UnauthorizedException,
    Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import jwtDecode, { JwtHeader } from 'jwt-decode';
import { AxiosResponse } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';
import { AppleJwtPayload } from './types/apple-jwt-payload.type';
import { AppleAuthKeysResponse } from './types/apple-auth-keys-response.type';

@Injectable()
export class AppleAuthService {
    constructor(private httpService: HttpService) {}

	public async getUserData(token: string): Promise<AppleJwtPayload> {
        const header: JwtHeader & { kid: string } = jwtDecode<JwtHeader & { kid: string }>(token, {
			header: true,
		});
        const kid: string = header.kid;
        const appleAuthKeysResponse: AppleAuthKeysResponse = await this.getAppleAuthKeys();
        const sharedKid: string = appleAuthKeysResponse.keys.filter(x => x['kid'] === kid)[0]?.['kid'];
		const client: jwksRsa.JwksClient = jwksRsa({
			jwksUri: 'https://appleid.apple.com/auth/keys',
		});
        let publicKey: string = '';
        try {
            const signingKey: jwksRsa.CertSigningKey | jwksRsa.RsaSigningKey = await client.getSigningKey(sharedKid);
            publicKey = signingKey.getPublicKey();
        } catch (error) {
            throw new InternalServerErrorException('Could not obtain Apple signing key');
        }
		if (!publicKey) {
			throw new InternalServerErrorException('Could not obtain Apple public keys');
		}
		try {
			const payload: AppleJwtPayload = <AppleJwtPayload>jwt.verify(token, publicKey);
            if (payload.iss !== 'https://appleid.apple.com') {
                throw new UnauthorizedException('Invalid token issuer');
            }
			return payload;
		} catch (error) {
			throw new UnauthorizedException('Invalid token');
		}
	}

    private async getAppleAuthKeys(): Promise<AppleAuthKeysResponse> {
        const observable: Observable<AxiosResponse<AppleAuthKeysResponse>> = this.httpService.get(
			'https://appleid.apple.com/auth/keys',
		);
        try {
            const res: AxiosResponse<AppleAuthKeysResponse> = await firstValueFrom(observable);
            return res.data;
        } catch(error) {
            throw new InternalServerErrorException('Could not obtain Apple public keys');
        }
    } 
}
