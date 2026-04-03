import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailAdapter } from '../../adapters/emailAdapter/email-adapter';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../repositories/userRepositories/users.repository';
import { User } from '../../../domain/entities/users.entity';

export class ResendEmailResendingEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendEmailResendingEmailCommand)
export class ResendEmailResendingEmailUseCase implements ICommandHandler<ResendEmailResendingEmailCommand> {
  constructor(
    @Inject(UsersRepository) private usersRepository: UsersRepository,
    @Inject(EmailAdapter) private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: ResendEmailResendingEmailCommand): Promise<void> {
    const foundUser: User | null =
      await this.usersRepository.findUserByLoginOrEmail(command.email);
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        field: 'email',
        message: 'Invalid email',
      });
    }
    if (foundUser.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        field: 'email',
        message: 'Email is confirmed',
      });
    }

    const newConfirmationCode = crypto.randomUUID();
    foundUser.refreshConfirmationCode(newConfirmationCode);
    await this.usersRepository.save(foundUser);

    await this.emailAdapter.sendEmail(
      foundUser.email,
      'ChiteS',
      newConfirmationCode,
    );
    return;
  }
}
