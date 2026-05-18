import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepository } from '../../../repositories/quizQuestionsRepository/questions.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Inject } from '@nestjs/common';

export class UpdateQuestionCommand {
  constructor(
    public id: string,
    public dto: { body: string; correctAnswers: string[] },
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand> {
  constructor(
    @Inject(QuizQuestionsRepository)
    private quizQuestionsRepository: QuizQuestionsRepository,
  ) {}

  async execute(command: UpdateQuestionCommand): Promise<void> {
    const numericId = parseInt(command.id, 10);
    if (isNaN(numericId)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        field: 'questionId',
        message: 'Question not found',
      });
    }
    const foundQuestion = await this.quizQuestionsRepository.findQuestionById(
      Number(numericId),
    );
    if (!foundQuestion)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'questionId',
        message: 'Question not found',
      });
    foundQuestion.updateQuestion(command.dto);
    await this.quizQuestionsRepository.save(foundQuestion);
    return;
  }
}
