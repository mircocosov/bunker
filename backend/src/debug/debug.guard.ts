import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DebugGuard implements CanActivate {
  constructor(private cfg: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const env = this.cfg.get<string>('NODE_ENV') ?? 'development';
    if (env !== 'production') return true;

    const req = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
    if (req.user?.role === 'ADMIN') return true;
    throw new ForbiddenException();
  }
}
