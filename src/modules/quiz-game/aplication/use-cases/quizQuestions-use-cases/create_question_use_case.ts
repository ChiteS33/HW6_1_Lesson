import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepository } from '../../../repositories/quizQuestionsRepository/questions.repository';
import { Inject } from '@nestjs/common';
import { Question } from 'src/modules/quiz-game/domain/entities/quiz_questions.entity';

export class CreateQuestionCommand {
  constructor(
    public dto: {
      body: string;
      correctAnswers: string[];
    },
  ) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand> {
  constructor(
    @Inject(QuizQuestionsRepository)
    private quizQuestionsRepository: QuizQuestionsRepository,
  ) {}

  async execute(command: CreateQuestionCommand): Promise<string> {
    const createQuestion = Question.createQuestion(command.dto);
    return await this.quizQuestionsRepository.save(createQuestion);
  }
}
