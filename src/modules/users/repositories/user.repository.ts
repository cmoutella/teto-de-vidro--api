import type { CreateUser } from '../schemas/endpoints/public/zod-validation/create-user.public.zod-validation'
import type {
  InterfaceUser,
  PublicInterfaceUser
} from '../schemas/models/user.interface'

export abstract class UserRepository {
  abstract createUser(newUser: CreateUser): Promise<PublicInterfaceUser>
  abstract getAllUsers(): Promise<PublicInterfaceUser[]>
  abstract getById(id: string): Promise<InterfaceUser>
  abstract getByEmail(email: string): Promise<InterfaceUser>
  abstract getByCPF(cpf: string): Promise<InterfaceUser>

  abstract updateUser(
    id: string,
    newData: Partial<InterfaceUser>
  ): Promise<PublicInterfaceUser>

  abstract deleteUser(id: string): Promise<void>

  abstract inviteUser(
    newUser: Pick<InterfaceUser, 'name' | 'email' | 'accessLevel' | 'role'>
  ): Promise<PublicInterfaceUser>
}
