export interface InterfaceHunt {
  id?: string;
  isActive?: boolean;
  creatorId: string;
  title?: string;
  type: 'buy' | 'rent' | 'either';
  movingExpected?: string;
  livingPeople?: number;
  livingPets?: number;
  minBudget?: number;
  maxBudget?: number;
  targets?: string[];
  invitedUsers?: string[];
}
