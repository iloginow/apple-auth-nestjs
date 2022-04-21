import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppleAuthService } from './apple-auth.service';

@Module({
    imports: [HttpModule],
    providers: [AppleAuthService],
    exports: [AppleAuthService],
})
export class AppleAuthModule {}
