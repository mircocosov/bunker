import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { AdminTraitsController } from './admin-traits/admin-traits.controller';
import { AdminScenesController } from './admin-scenes/admin-scenes.controller';
import { AdminActionCardsController } from './admin-action-cards/admin-action-cards.controller';
import { HealthController } from './health/health.controller';
import { ActionDedupeService } from './realtime/action-dedupe.service';
import { RoomRegistryService } from './realtime/room-registry.service';
import { RoomsGateway } from './realtime/rooms.gateway';
import { AdminTraitsService } from './admin-traits/admin-traits.service';
import { AdminScenesService } from './admin-scenes/admin-scenes.service';
import { AdminActionCardsService } from './admin-action-cards/admin-action-cards.service';
import { ChatFilterController } from './chat-filter/chat-filter.controller';
import { ChatFilterService } from './chat-filter/chat-filter.service';
import { CharacterController } from './character/character.controller';
import { CharacterService } from './character/character.service';
import { AdminCosmeticsController } from './admin-cosmetics/admin-cosmetics.controller';
import { BlacklistController } from './blacklist/blacklist.controller';
import { BlacklistService } from './blacklist/blacklist.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';
import { GameSessionController } from './game-session/game-session.controller';
import { GameSessionService } from './game-session/game-session.service';

@Module({
  imports: [],
  controllers: [AuthController, HealthController, AdminTraitsController, AdminScenesController, AdminActionCardsController, AdminCosmeticsController, ChatFilterController, CharacterController, BlacklistController, SettingsController, GameSessionController],
  providers: [RoomsGateway, RoomRegistryService, ActionDedupeService, AdminTraitsService, AdminScenesService, AdminActionCardsService, ChatFilterService, CharacterService, BlacklistService, SettingsService, GameSessionService],
})
export class AppModule {}
