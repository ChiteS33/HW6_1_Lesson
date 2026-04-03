import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailAdapter } from '../../adapters/emailAdapter/email-adapter';
import { BcryptAdapter } from '../../adapters/bcryptAdapter/bcrypt.adapter';
import { UsersService } from '../../users.service';
import { UsersRepository } from '../../../repositories/userRepositories/users.repository';
import { ConfigService } from '@nestjs/config';
import { UserInputDtoValidation } from '../../../validation/inputValidationBody.validation';
import { User } from '../../../domain/entities/users.entity';

export class RegistrationInSystemCommand {
  constructor(public body: UserInputDtoValidation) {}
}

@CommandHandler(RegistrationInSystemCommand)
export class RegistrationInSystemUseCase implements ICommandHandler<RegistrationInSystemCommand> {
  constructor(
    @Inject(UsersService) private usersService: UsersService,
    @Inject(UsersRepository) private usersRepository: UsersRepository,
    @Inject(EmailAdapter) private emailAdapter: EmailAdapter,
    @Inject(BcryptAdapter) private bcryptService: BcryptAdapter,
    @Inject(ConfigService) private configService: ConfigService,
  ) {}
  async execute(command: RegistrationInSystemCommand): Promise<void> {
    const passwordHash = await this.bcryptService.hashMake(
      command.body.password,
    );
    await this.usersService.findUserByLogin(command.body.login);
    await this.usersService.findUserByEmail(command.body.email);

    const newUser = User.createUser(command.body, passwordHash);
    await this.usersRepository.save(newUser);

    this.emailAdapter.sendEmail(
      command.body.email,
      'Chites',
      newUser.confirmationCode!,
    );
    return;
  }
}
