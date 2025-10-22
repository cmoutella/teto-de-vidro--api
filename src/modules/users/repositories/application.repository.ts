import type { CreateApplicationUser } from '../schemas/endpoints/public/zod-validation/create-application-user.public.zod-validation'
import type {
  InterfaceApplicationUser,
  PublicInterfaceApplicationUser
} from '../schemas/models/application.interface'

export abstract class UserApplicationRepository {
  abstract createApp(
    newUser: CreateApplicationUser
  ): Promise<PublicInterfaceApplicationUser>
  abstract getById(id: string): Promise<InterfaceApplicationUser>
  abstract getByRepresentativeEmail(
    email: string
  ): Promise<InterfaceApplicationUser>

  abstract updateApp(
    id: string,
    newData: Partial<InterfaceApplicationUser>
  ): Promise<PublicInterfaceApplicationUser>

  abstract deleteApp(id: string): Promise<void>

  abstract getApps(): Promise<PublicInterfaceApplicationUser[]>
  abstract getAppByName(name: string): Promise<PublicInterfaceApplicationUser>
}
