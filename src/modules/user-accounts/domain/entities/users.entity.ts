import { Column, Entity } from 'typeorm';
import { add } from 'date-fns';
import { UserInputDtoValidation } from '../../validation/inputValidationBody.validation';
import { BaseDbEntity } from '../../../../core/entity/baseDb.entity';

@Entity({ name: 'Users' })
export class User extends BaseDbEntity {
  @Column({ type: 'varchar', collation: 'C' })
  login: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true })
  confirmationCode: string | null;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ type: 'varchar', nullable: true })
  recoveryCode: string | null;

  @Column({ type: 'boolean' })
  isConfirmed: boolean;

  public static createUserByAdmin(
    inputDto: UserInputDtoValidation,
    passwordHash: string,
  ): User {
    const newUser = new User();

    newUser.login = inputDto.login;
    newUser.email = inputDto.email;
    newUser.passwordHash = passwordHash;
    newUser.confirmationCode = null;
    newUser.expirationDate = new Date();
    newUser.recoveryCode = null;
    newUser.isConfirmed = true;
    return newUser;
  }

  public static createUser(body: UserInputDtoValidation, passwordHash: string) {
    const newUser = new User();

    newUser.login = body.login;
    newUser.email = body.email;
    newUser.passwordHash = passwordHash;
    newUser.confirmationCode = crypto.randomUUID();
    newUser.expirationDate = add(new Date(), { hours: 1 });
    newUser.recoveryCode = null;
    newUser.isConfirmed = false;
    return newUser;
  }
  changeConfirmationStatus(status: boolean) {
    this.isConfirmed = status;
    return;
  }

  setRecoveryCode(recoveryCode: string) {
    this.recoveryCode = recoveryCode;
    return;
  }

  refreshConfirmationCode(newConfirmationCode: string) {
    this.confirmationCode = newConfirmationCode;
    this.expirationDate = add(new Date(), { hours: 1 });
    return;
  }
  updateEmail(newHash: string) {
    this.email = newHash;
    return;
  }
}
