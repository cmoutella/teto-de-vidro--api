export interface InterfaceApplicationUser {
  id?: string

  // identify owner
  name: string
  email: string

  // generated
  role: 'app'
  password?: string

  // history
  createdAt: string
  updatedAt: string
}

// returned on public routes
export type PublicInterfaceApplicationUser = Omit<
  InterfaceApplicationUser,
  'password'
>

export type SafeInterfaceApplicationUser = Omit<
  InterfaceApplicationUser,
  'password' | 'email'
>
