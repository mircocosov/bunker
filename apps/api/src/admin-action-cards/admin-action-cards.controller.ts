import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ActionCardScope, ActionCardType, AdminActionCardsService } from './admin-action-cards.service';

class CreateActionCardDto {
  type!: ActionCardType;
  target!: string;
  scope!: ActionCardScope;
  description!: string;
}

class UpdateActionCardDto {
  type?: ActionCardType;
  target?: string;
  scope?: ActionCardScope;
  description?: string;
}

@Controller('admin/action-cards')
export class AdminActionCardsController {
  constructor(private readonly adminActionCardsService: AdminActionCardsService) {}

  @Get()
  list() {
    return this.adminActionCardsService.list();
  }

  @Post()
  create(@Body() body: CreateActionCardDto) {
    return this.adminActionCardsService.create({
      ...body,
      type: this.parseType(body.type),
      scope: this.parseScope(body.scope),
    });
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateActionCardDto) {
    return this.adminActionCardsService.update(id, {
      ...body,
      type: body.type ? this.parseType(body.type) : undefined,
      scope: body.scope ? this.parseScope(body.scope) : undefined,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    this.adminActionCardsService.remove(id);
    return { deleted: true };
  }

  private parseType(type: string): ActionCardType {
    const allowed: ActionCardType[] = ['replace', 'upgrade', 'downgrade', 'add'];
    if (!allowed.includes(type as ActionCardType)) {
      throw new BadRequestException('Unknown card type');
    }

    return type as ActionCardType;
  }

  private parseScope(scope: string): ActionCardScope {
    const allowed: ActionCardScope[] = ['self', 'all', 'all_with_opened', 'bunker_upgrade'];
    if (!allowed.includes(scope as ActionCardScope)) {
      throw new BadRequestException('Unknown card scope');
    }

    return scope as ActionCardScope;
  }
}
