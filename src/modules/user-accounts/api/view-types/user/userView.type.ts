export type UserViewType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  passwordHash?: string;
  confirmationCode?: string;
  expirationDate?: Date;
  isConfirmed?: boolean;
  recoveryCode?: string;
};
