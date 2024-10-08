import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DEFAULT_LIMIT } from 'src/shared/const/pagination';
import { TargetPropertyRepository } from '../target-property.repository';
import { InterfaceTargetProperty } from '../../schemas/models/target-property.interface';
import { TargetProperty } from '../../schemas/target-property.schema';

export class TargetPropertyMongooseRepository
  implements TargetPropertyRepository
{
  constructor(
    @InjectModel(TargetProperty.name)
    private targetPropertyModel: Model<TargetProperty>,
  ) {}

  async createTargetProperty(
    newTarget: InterfaceTargetProperty,
  ): Promise<TargetProperty> {
    const createProperty = new this.targetPropertyModel(newTarget);

    await createProperty.save();

    if (!createProperty) return null;

    return createProperty.toObject();
  }

  async getAllTargetsByHunt(
    huntId: string,
    page = 1,
    limit = DEFAULT_LIMIT,
  ): Promise<InterfaceTargetProperty[]> {
    const offset = (page - 1) * limit;

    const foundProperties = await this.targetPropertyModel
      .find({ huntId: huntId })
      .skip(offset)
      .limit(limit)
      .exec();

    return foundProperties.map((prop) => prop.toObject());
  }

  async getOneTargetById(id: string): Promise<InterfaceTargetProperty> {
    return await this.targetPropertyModel.findById(id).exec();
  }

  async updateTargetProperty(
    id: string,
    data: Partial<InterfaceTargetProperty>,
  ): Promise<void> {
    const foundProperty = this.targetPropertyModel.findById(id).exec();

    if (!foundProperty) {
      return null;
    }

    await this.targetPropertyModel
      .updateOne({ _id: id }, { ...foundProperty, ...data })
      .exec();
  }

  async deleteTargetProperty(id: string): Promise<void> {
    await this.targetPropertyModel.deleteOne({ _id: id }).exec();
  }
}
