import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { HealthController } from './health/health.controller';
import { ActionDedupeService } from './realtime/action-dedupe.service';
import { RoomRegistryService } from './realtime/room-registry.service';
import { RoomsGateway } from './realtime/rooms.gateway';

@Module({
  imports: [],
  controllers: [AuthController, HealthController],
  providers: [RoomsGateway, RoomRegistryService, ActionDedupeService],
})
export class AppModule {}
