"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppleAuthService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const jwt = require("jsonwebtoken");
const jwksRsa = require("jwks-rsa");
const jwt_decode_1 = require("jwt-decode");
const rxjs_1 = require("rxjs");
let AppleAuthService = class AppleAuthService {
    constructor(httpService) {
        this.httpService = httpService;
    }
    async getUserData(token) {
        var _a;
        const header = (0, jwt_decode_1.default)(token, {
            header: true,
        });
        const kid = header.kid;
        const appleAuthKeysResponse = await this.getAppleAuthKeys();
        const sharedKid = (_a = appleAuthKeysResponse.keys.filter(x => x['kid'] === kid)[0]) === null || _a === void 0 ? void 0 : _a['kid'];
        const client = jwksRsa({
            jwksUri: 'https://appleid.apple.com/auth/keys',
        });
        let publicKey = '';
        try {
            const signingKey = await client.getSigningKey(sharedKid);
            publicKey = signingKey.getPublicKey();
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Could not obtain Apple signing key');
        }
        if (!publicKey) {
            throw new common_1.InternalServerErrorException('Could not obtain Apple public keys');
        }
        try {
            const payload = jwt.verify(token, publicKey);
            if (payload.iss !== 'https://appleid.apple.com') {
                throw new common_1.UnauthorizedException('Invalid token issuer');
            }
            return payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async getAppleAuthKeys() {
        const observable = this.httpService.get('https://appleid.apple.com/auth/keys');
        try {
            const res = await (0, rxjs_1.firstValueFrom)(observable);
            return res.data;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Could not obtain Apple public keys');
        }
    }
};
AppleAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AppleAuthService);
exports.AppleAuthService = AppleAuthService;
//# sourceMappingURL=apple-auth.service.js.map