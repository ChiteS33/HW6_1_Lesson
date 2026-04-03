import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptAdapter } from '../../adapters/bcryptAdapter/bcrypt.adapter';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../repositories/userRepositories/users.repository';
import { UserInputDtoValidation } from '../../../validation/inputValidationBody.validation';
import { User } from '../../../domain/entities/users.entity';

export class CreateUserCommand {
  constructor(public inputDto: UserInputDtoValidation) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(UsersRepository) private usersRepository: UsersRepository,
    @Inject(BcryptAdapter) private bcryptService: BcryptAdapter,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const foundedUserByLogin = await this.usersRepository.findUserByLogin(
      command.inputDto.login,
    );

    if (foundedUserByLogin)
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        field: 'login',
        message: 'Login now is using',
      });
    const foundedUserByEmail = await this.usersRepository.findUserByEmail(
      command.inputDto.email,
    );

    if (foundedUserByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        field: 'email',
        message: 'Email already in use',
      });
    }
    const hash = await this.bcryptService.hashMake(command.inputDto.password);
    const newUser = User.createUserByAdmin(command.inputDto, hash);
    return await this.usersRepository.save(newUser);
  }
}
