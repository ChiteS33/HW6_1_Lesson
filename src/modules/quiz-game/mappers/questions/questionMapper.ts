import { QuestionView } from '../../api/view_types/questions/questionView.type';
import { Question } from '../../domain/entities/quiz_questions.entity';

export const questionMapper = (questionEntity: Question): QuestionView => {
  return {
    id: questionEntity.id.toString(),
    body: questionEntity.body,
    correctAnswers: questionEntity.answers,
    published: questionEntity.published === 'true',
    createdAt: questionEntity.createdAt.toISOString(),
    updatedAt: questionEntity.updatedQuestionAt?.toISOString() ?? null,
  };
};
