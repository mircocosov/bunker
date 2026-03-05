import {
  BadRequestException,
  Body,
  NotFoundException,
  Res,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';
import { AdminScenesService } from './admin-scenes.service';

class CreateSceneDto {
  name!: string;
  description!: string;
  imageUrl!: string;
}

class UpdateSceneDto {
  name?: string;
  description?: string;
  imageUrl?: string;
}

type UploadedSceneFile = {
  originalname: string;
  filename: string;
};

@Controller()
export class AdminScenesController {
  constructor(private readonly adminScenesService: AdminScenesService) {}

  @Post('admin/scenes/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          _req: unknown,
          _file: unknown,
          cb: (error: Error | null, destination: string) => void,
        ) => cb(null, join(__dirname, '..', '..', 'uploads', 'scenes')),
        filename: (
          _req: unknown,
          file: { originalname?: string },
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const safeExt = extname(file.originalname || '.png') || '.png';
          cb(
            null,
            `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`,
          );
        },
      }),
    }),
  )
  uploadSceneImage(@UploadedFile() file?: UploadedSceneFile) {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    return {
      filename: file.filename,
      url: `/bunker/api/assets/scenes/${file.filename}`,
    };
  }

  @Get('admin/scenes')
  listScenes() {
    return this.adminScenesService.list();
  }

  @Post('admin/scenes')
  createScene(@Body() body: CreateSceneDto) {
    return this.adminScenesService.create(body);
  }

  @Patch('admin/scenes/:id')
  updateScene(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSceneDto,
  ) {
    return this.adminScenesService.update(id, body);
  }

  @Delete('admin/scenes/:id')
  removeScene(@Param('id', ParseIntPipe) id: number) {
    this.adminScenesService.remove(id);
    return { deleted: true };
  }

  @Get('assets/scenes/:filename')
  getSceneImage(@Param('filename') filename: string, @Res() res: Response) {
    const fullPath = join(this.adminScenesService.uploadsDir, filename);
    if (!existsSync(fullPath)) {
      throw new NotFoundException('asset not found');
    }

    res.setHeader('Cache-Control', 'public, max-age=3600');
    const ext = extname(filename).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      res.type('image/jpeg');
    } else if (ext === '.webp') {
      res.type('image/webp');
    } else {
      res.type('image/png');
    }

    return createReadStream(fullPath).pipe(res);
  }
}
