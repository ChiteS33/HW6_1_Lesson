export type UserEntityType = {
  id: number;
  login: string;
  email: string;
  createdAt: Date;
  passwordHash: string;
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
  recoveryCode: string;
};
