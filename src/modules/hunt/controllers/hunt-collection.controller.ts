import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { LoggingInterceptor } from '../../../shared/interceptors/logging.interceptor';
import { ZodValidationPipe } from '../../../shared/pipe/zod-validation.pipe';
import { HuntService } from '../services/hunt-collection.service';

const CONTRACT_TYPE = ['buy', 'rent', 'either'] as const;

const createHuntSchema = z.object({
  creatorId: z.string(),
  invitedUsers: z.array(z.string()).optional(),
  title: z.string().optional(),
  movingExpected: z.string().optional(),
  livingPeople: z.number().optional(),
  livingPets: z.number().optional(),
  type: z.enum(CONTRACT_TYPE).optional(),
});

type CreateHunt = z.infer<typeof createHuntSchema>;

const updateHuntSchema = z.object({
  invitedUsers: z.array(z.string()).optional(),
  title: z.string().optional(),
  movingExpected: z.string().optional(),
  livingPeople: z.number().optional(),
  livingPets: z.number().optional(),
  type: z.enum(CONTRACT_TYPE).optional(),
});

type UpdateHunt = z.infer<typeof updateHuntSchema>;

@UseInterceptors(LoggingInterceptor)
@Controller('Hunts')
export class HuntController {
  constructor(private readonly huntService: HuntService) {}

  @UsePipes(new ZodValidationPipe(createHuntSchema))
  @Post()
  async createHunt(
    @Body()
    {
      title,
      creatorId,
      invitedUsers,
      livingPeople,
      livingPets,
      movingExpected,
      type,
    }: CreateHunt,
  ) {
    await this.huntService.createHunt({
      title,
      creatorId,
      invitedUsers,
      livingPeople,
      livingPets,
      movingExpected,
      type,
    });
  }

  @Get('/search/:userId')
  async getAllHuntsByUser(@Param('userId') userId: string) {
    return await this.huntService.getAllHuntsByUser(userId);
  }

  @Get(':id')
  async getOneHuntById(@Param('id') id: string) {
    return await this.huntService.getOneHuntById(id);
  }

  @Put(':id')
  async updateHunt(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateHuntSchema))
    updateData: UpdateHunt,
  ) {
    return await this.huntService.updateHunt(id, updateData);
  }

  @Delete(':id')
  async deleteHunt(@Param('id') id: string) {
    await this.huntService.deleteHunt(id);
  }
}
