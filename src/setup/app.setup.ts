import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import { DomainHttpExceptionsFilter } from '../core/exceptions/filters/domain-exceptions.filter';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  app.useGlobalFilters(new DomainHttpExceptionsFilter());
}
