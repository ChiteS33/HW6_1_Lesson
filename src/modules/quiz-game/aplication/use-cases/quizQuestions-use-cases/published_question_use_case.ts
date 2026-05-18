import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { QuizQuestionsRepository } from '../../../repositories/quizQuestionsRepository/questions.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { ChekBoolean } from '../../../api/quizQuestions.controller';

export class PublishedQuestionCommand {
  constructor(
    public id: string,
    public published: ChekBoolean,
  ) {}
}

@CommandHandler(PublishedQuestionCommand)
export class PublishedQuestionUseCase implements ICommandHandler<PublishedQuestionCommand> {
  constructor(
    @Inject(QuizQuestionsRepository)
    private quizQuestionsRepository: QuizQuestionsRepository,
  ) {}

  async execute(command: PublishedQuestionCommand): Promise<void> {
    const numericId = parseInt(command.id, 10);
    if (isNaN(numericId)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        field: 'questionId',
        message: 'Question not found',
      });
    }
    const publishedStatus = command.published ? 'true' : 'false';
    const foundQuestion = await this.quizQuestionsRepository.findQuestionById(
      Number(numericId),
    );
    if (!foundQuestion)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        field: 'questionId',
        message: 'Question not Found',
      });

    foundQuestion.publishAndUnpublishQuestion(publishedStatus);
    await this.quizQuestionsRepository.save(foundQuestion);
    return;
  }
}
