import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';
import { LobbyModule } from './lobby/lobby.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { SceneModule } from './scene/scene.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, LobbyModule, AdminModule, ChatModule, SceneModule],
  providers: [PrismaService]
})
export class AppModule {}
