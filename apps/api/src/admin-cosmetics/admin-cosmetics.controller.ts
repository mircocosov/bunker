import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CharacterService, CosmeticCategory } from '../character/character.service';

class CreateCosmeticDto {
  category!: CosmeticCategory;
  name!: string;
  imageUrl?: string;
  unlockWins!: number;
}

class UpdateCosmeticDto {
  category?: CosmeticCategory;
  name?: string;
  imageUrl?: string;
  unlockWins?: number;
}

@Controller('admin/cosmetics')
export class AdminCosmeticsController {
  constructor(private readonly characterService: CharacterService) {}

  @Get()
  list(@Query('category') category?: CosmeticCategory) {
    return this.characterService.listCosmetics(category);
  }

  @Post()
  create(@Body() body: CreateCosmeticDto) {
    return this.characterService.createCosmetic({
      category: body.category,
      name: body.name,
      imageUrl: body.imageUrl,
      unlockWins: body.unlockWins,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCosmeticDto) {
    return this.characterService.updateCosmetic(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.characterService.removeCosmetic(Number(id));
    return { deleted: true };
  }
}
