import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AdminTraitsService, TraitCategory } from './admin-traits.service';

class UpsertTraitDto {
  value!: string;
  severityEnabled?: boolean;
  severityLevel?: 30 | 50 | 70 | 90;
}

@Controller('admin/traits')
export class AdminTraitsController {
  constructor(private readonly adminTraitsService: AdminTraitsService) {}

  @Get(':category')
  list(@Param('category') category: string) {
    return this.adminTraitsService.list(this.parseCategory(category));
  }

  @Post(':category')
  create(@Param('category') category: string, @Body() body: UpsertTraitDto) {
    return this.adminTraitsService.create(this.parseCategory(category), body);
  }

  @Patch(':category/:id')
  update(
    @Param('category') category: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpsertTraitDto,
  ) {
    return this.adminTraitsService.update(this.parseCategory(category), id, body);
  }

  @Delete(':category/:id')
  remove(@Param('category') category: string, @Param('id', ParseIntPipe) id: number) {
    this.adminTraitsService.remove(this.parseCategory(category), id);
    return { deleted: true };
  }

  private parseCategory(category: string): TraitCategory {
    const allowed: TraitCategory[] = ['profession', 'phobia', 'hobby', 'luggage', 'fact', 'health'];
    if (!allowed.includes(category as TraitCategory)) {
      throw new BadRequestException('Unknown trait category');
    }

    return category as TraitCategory;
  }
}
