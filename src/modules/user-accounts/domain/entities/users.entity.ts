//   public static createUserByAdmin(body: UserInputDtoForCreate): UserModel {
//     const emailConf = {
//       confirmationCode: null,
//       expirationDate: new Date(),
//       isConfirmed: true,
//     };
//     const newUser = new UserModel();
//     newUser.login = body.login;
//     newUser.email = body.email;
//     newUser.passwordHash = body.passwordHash;
//     newUser.createdAt = new Date();
//     newUser.emailConfirmation = emailConf;
//     newUser.recoveryData = {
//       recoveryCode: null,
//     };
//     return newUser;
//   }
//
//   public static createUser(
//     body: UserInputDtoValidation,
//     passwordHash: string,
//   ): UserModel {
//     const emailConf = {
//       confirmationCode: crypto.randomUUID(),
//       expirationDate: add(new Date(), { hours: 1 }),
//       isConfirmed: false,
//     };
//     const newUser = new UserModel();
//     newUser.login = body.login;
//     newUser.email = body.email;
//     newUser.passwordHash = passwordHash;
//     newUser.createdAt = new Date();
//     newUser.emailConfirmation = emailConf;
//     newUser.recoveryData = {
//       recoveryCode: null,
//     };
//     return newUser;
//   }
//
//   changeConfirmationStatus(status: boolean) {
//     this.emailConfirmation.isConfirmed = status;
//     return;
//   }
//
//   recoveryCode() {
//     this.recoveryData.recoveryCode = crypto.randomUUID();
//     return;
//   }
//
//   refreshConfirmationCode() {
//     this.emailConfirmation.confirmationCode = crypto.randomUUID();
//     this.emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
//     return;
//   }
// }
//
// export const UserSchema = SchemaFactory.createForClass(UserModel);
// UserSchema.loadClass(UserModel);
// export interface UserModelI extends Model<UserDocument> {
//   createUserByAdmin(dto: UserInputDtoForCreate): UserModel;
// }
