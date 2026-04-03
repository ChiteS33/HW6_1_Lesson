import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../repositories/userRepositories/users.repository';
import { User } from '../../../domain/entities/users.entity';

export class ConfirmRegistrationCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase implements ICommandHandler<ConfirmRegistrationCommand> {
  constructor(
    @Inject(UsersRepository) private usersRepository: UsersRepository,
  ) {}
  async execute(command: ConfirmRegistrationCommand): Promise<void> {
    const foundUser: User | null =
      await this.usersRepository.findUserByConfirmationCode(command.code);
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        field: 'code',
        message: 'Invalid confirmation code',
      });
    }

    if (foundUser.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        field: 'code',
        message: 'User is confirmed',
      });
    }
    if (foundUser.confirmationCode !== command.code) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        field: 'confirmationCode',
        message: 'Confirmation Code does not match',
      });
    }
    if (!foundUser.expirationDate || foundUser.expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        field: 'confirmationCode',
        message: 'Confirmation expired',
      });
    }

    foundUser.changeConfirmationStatus(true);
    await this.usersRepository.save(foundUser);
    return;
  }
}
