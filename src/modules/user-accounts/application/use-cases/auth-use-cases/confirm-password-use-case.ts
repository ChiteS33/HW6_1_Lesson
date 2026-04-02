import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../adapters/bcryptAdapter/bcrypt.adapter';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../repositories/userRepositories/users.repository';
import { UserEntityType } from '../../../repositories/entity-types/user/userEntity.type';

export class ConfirmPasswordRecoveryCommand {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(ConfirmPasswordRecoveryCommand)
export class ConfirmPasswordRecoveryUseCase implements ICommandHandler<ConfirmPasswordRecoveryCommand> {
  constructor(
    @Inject(UsersRepository) private usersRepository: UsersRepository,
    @Inject(BcryptAdapter) private bcryptService: BcryptAdapter,
  ) {}

  async execute(command: ConfirmPasswordRecoveryCommand): Promise<void> {
    const foundUser: UserEntityType | null =
      await this.usersRepository.findUserByRecoveryCode(command.recoveryCode);
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        field: 'recoveryCode',
        message: 'Invalid recoveryCode',
      });
    }
    const newHash = await this.bcryptService.hashMake(command.newPassword);
    await this.usersRepository.updatePassword(foundUser.id, newHash);
    return;
  }
}
