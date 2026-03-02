import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { LobbyModule } from './lobby/lobby.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { SceneModule } from './scene/scene.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, LobbyModule, AdminModule, ChatModule, SceneModule]
})
export class AppModule {}
