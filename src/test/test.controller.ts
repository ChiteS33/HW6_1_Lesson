import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class DeleteAllController {
  constructor(@InjectDataSource() private datasource: DataSource) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('all-data')
  async clearAllCollections() {
    await this.datasource.query(
      `TRUNCATE TABLE "Users", "Sessions", "Posts", "Blogs", "Comments", "LikesForComments", "LikesForPosts", "QuizGames", "QuizPlayers", "QuizQuestionForGame", "QuizQuestions", "QuizPlayerAnswers"  RESTART IDENTITY CASCADE`,
    );
  }
}
