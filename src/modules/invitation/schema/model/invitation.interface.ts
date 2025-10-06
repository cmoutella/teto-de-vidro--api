export interface InvitationInterface {
  id: string
  userId: string
  invitedUserId: string
  status: 'pending' | 'accepted' | 'declined'

  expiresAt: string
  createdAt: string
  updatedAt: string
}
