import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users.service';
import { UsersRepository } from '../../../repositories/userRepositories/users.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(UsersRepository) private usersRepository: UsersRepository,
    @Inject(UsersService) private usersService: UsersService,
  ) {}
  async execute(command: DeleteUserCommand): Promise<void> {
    await this.usersService.findUserById(command.userId);
    await this.usersRepository.deleteUserById(command.userId);
    return;
  }
}
