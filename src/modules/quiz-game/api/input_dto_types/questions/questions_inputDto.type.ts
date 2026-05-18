import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { IsArray } from 'class-validator';

export class InputPaginationTypeForQuestion {
  @IsStringWithTrim(10, 500)
  body: string;
  @IsArray()
  correctAnswers: string[];
}
