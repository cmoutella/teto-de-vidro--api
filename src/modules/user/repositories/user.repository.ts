import type {
  InterfaceUser,
  PublicInterfaceUser
} from '../schemas/models/user.interface'
import type { CreateUser } from '../schemas/zod-validation/create-user.zod-validation'

export abstract class UserRepository {
  abstract createUser(newUser: CreateUser): Promise<PublicInterfaceUser>
  abstract getAllUsers(): Promise<PublicInterfaceUser[]>
  abstract getById(username: string): Promise<InterfaceUser>
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

  abstract getApplications(): Promise<PublicInterfaceUser[]>
  abstract getAppByName(name: string): Promise<PublicInterfaceUser>
}
