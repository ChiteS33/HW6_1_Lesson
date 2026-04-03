import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailAdapter } from '../../adapters/emailAdapter/email-adapter';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../repositories/userRepositories/users.repository';
import { User } from '../../../domain/entities/users.entity';

export class RecoveryPasswordCommand {
  constructor(public email: string) {}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase implements ICommandHandler<RecoveryPasswordCommand> {
  constructor(
    @Inject(UsersRepository) private usersRepository: UsersRepository,
    @Inject(EmailAdapter) private emailAdapter: EmailAdapter,
  ) {}

  async execute(command: RecoveryPasswordCommand): Promise<void> {
    const foundUser: User | null =
      await this.usersRepository.findUserByLoginOrEmail(command.email);
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        field: 'email',
        message: 'Invalid email',
      });
    }

    const recoveryCode = crypto.randomUUID();
    foundUser.setRecoveryCode(recoveryCode);
    await this.usersRepository.save(foundUser);
    await this.emailAdapter.resendEmail(command.email, recoveryCode);
    return;
  }
}
