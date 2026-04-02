import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { add } from 'date-fns';

import { InsertReturningType } from '../../../../core/types/id.type';
import { UserEntityType } from '../entity-types/user/userEntity.type';
import { UserInputDtoValidation } from '../../validation/inputValidationBody.validation';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  async createUserByAdmin(
    login: string,
    email: string,
    hash: string,
  ): Promise<string> {
    const createdUserId: InsertReturningType[] = await this.datasource.query<
      InsertReturningType[]
    >(
      `INSERT INTO "Users" ("login", "email", "passwordHash", "createdAt")
       VALUES ($1, $2, $3, NOW())
    RETURNING "id"`,
      [login, email, hash],
    );

    return createdUserId[0].id.toString();
  }

  async createUser(
    body: UserInputDtoValidation,
    passwordHash: string,
    needConfirm: boolean,
  ): Promise<number> {
    const createdUserId: InsertReturningType[] = await this.datasource.query(
      `INSERT INTO "Users" ("login", "email", "passwordHash", "createdAt", "confirmationCode", "expirationDate", "isConfirmed")
  VALUES ($1, $2, $3, $4, $5, $6, $7 )
  RETURNING id`,
      [
        body.login,
        body.email,
        passwordHash,
        new Date(),
        crypto.randomUUID(),
        add(new Date(), { hours: 4 }),
        needConfirm,
      ],
    );
    return createdUserId[0].id;
  }

  async findUserById(userId: string): Promise<UserEntityType | null> {
    const foundUser: UserEntityType[] = await this.datasource.query(
      'SELECT * FROM "Users" WHERE id = $1',
      [userId],
    );
    return foundUser[0] ?? null;
  }

  async deleteUserById(userId: string): Promise<void> {
    await this.datasource.query(
      `DELETE 
    FROM "Users" 
    WHERE id = $1`,
      [userId],
    );
    return;
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserEntityType | null> {
    const foundUser: UserEntityType[] = await this.datasource.query(
      `SELECT *
   FROM "Users"
   WHERE "login" = $1 OR "email" = $1`,
      [loginOrEmail],
    );
    return foundUser[0] ?? null;
  }

  async findUserByConfirmationCode(
    code: string,
  ): Promise<UserEntityType | null> {
    const foundUser: UserEntityType[] = await this.datasource.query(
      `SELECT * FROM "Users" WHERE "confirmationCode" = $1`,
      [code],
    );
    return foundUser[0] ?? null;
  }

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserEntityType | null> {
    const foundUser: UserEntityType[] = await this.datasource.query(
      `SELECT * FROM "Users"
     WHERE "recoveryCode" = $1`,
      [recoveryCode],
    );
    return foundUser[0] ?? null;
  }

  async findUserByEmail(email: string): Promise<UserEntityType | null> {
    const foundUser: UserEntityType[] = await this.datasource.query(
      'SELECT * FROM "Users" WHERE "email" = $1',
      [email],
    );
    return foundUser[0] ?? null;
  }

  async findUserByLogin(login: string): Promise<UserEntityType | null> {
    const foundUser: UserEntityType[] = await this.datasource.query(
      'SELECT * FROM "Users" WHERE "login" = $1',
      [login],
    );
    return foundUser[0] ?? null;
  }

  async updateRecoveryCode(
    userId: number,
    recoveryCode: string,
  ): Promise<void> {
    await this.datasource.query(
      `UPDATE "Users" 
    SET "recoveryCode" = $1
    WHERE "id" = $2`,
      [recoveryCode, userId],
    );
    return;
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await this.datasource.query(
      `UPDATE "Users" SET "passwordHas" = $1 WHERE "userId" = $2`,
      [passwordHash, userId],
    );
    return;
  }

  async refreshConfirmationCode(
    newConfirmationCode: string,
    newExpDate: Date,
    userId: number,
  ): Promise<void> {
    await this.datasource.query(
      `UPDATE "Users" SET "confirmationCode" = $1, "expirationDate" = $2
    WHERE id = $3`,
      [newConfirmationCode, newExpDate, userId],
    );
    return;
  }

  async changeConfirmationStatus(
    status: boolean,
    userId: number,
  ): Promise<void> {
    await this.datasource.query(
      `UPDATE "Users" SET "isConfirmed" = $1
     WHERE id = $2`,
      [status, userId],
    );
    return;
  }
}
