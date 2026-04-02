import { IsStringWithTrim } from '../../../core/decorators/validation/is-string-with-trim';
import { Matches } from 'class-validator';

export class UserInputDtoValidation {
  @IsStringWithTrim(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;
  @IsStringWithTrim(6, 20)
  password: string;
  @IsStringWithTrim(1, 100)
  @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
  email: string;
}
