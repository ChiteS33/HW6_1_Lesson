import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionForGame } from '../../domain/entities/quiz_game_questions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionForGameRepository {
  constructor(
    @InjectRepository(QuestionForGame)
    private questionRepository: Repository<QuestionForGame>,
  ) {}

  async save(question: QuestionForGame[]): Promise<QuestionForGame[]> {
    return this.questionRepository.save(question);
  }

  async findQuestionsByGameId(gameId: number): Promise<QuestionForGame[]> {
    return this.questionRepository.find({
      where: { gameId },
      relations: {
        question: true,
      },
      order: {
        orderIndex: 'ASC',
      },
    });
  }
}
