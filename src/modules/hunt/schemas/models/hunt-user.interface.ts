export interface HuntUserInterface {
  huntId: string
  userId: string
}

export type HuntInvitationResult = {
  email: string
  status: 'added' | 'invited' | 'already-in-hunt' | 'error'
  message?: string
}
