import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { QuizQuestionsRepository } from '../../../repositories/quizQuestionsRepository/questions.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Question } from '../../../domain/entities/quiz_questions.entity';

export class DeleteQuestionByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionByIdCommand)
export class DeleteQuestionByIdUseCase implements ICommandHandler<DeleteQuestionByIdCommand> {
  constructor(
    @Inject(QuizQuestionsRepository)
    private quizQuestionsRepository: QuizQuestionsRepository,
  ) {}
  async execute(command: DeleteQuestionByIdCommand): Promise<void> {
    const numericId = parseInt(command.id, 10);
    if (isNaN(numericId)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        field: 'questionId',
        message: 'Question not found',
      });
    }
    const foundQuestion: Question | null =
      await this.quizQuestionsRepository.findQuestionById(Number(numericId));
    if (!foundQuestion) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'questionId',
        message: 'Question not found',
      });
    }

    return await this.quizQuestionsRepository.delete(Number(numericId));
  }
}
