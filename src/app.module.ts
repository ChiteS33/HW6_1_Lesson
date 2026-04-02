import { configModule } from './config-dynamic-module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsModule } from './modules/bloggers-platform/bloggers-platform.module';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { ConfigModule, ConfigService } from '@nestjs/config';

const errorFilters = [
  {
    provide: APP_FILTER,
    useClass: AllHttpExceptionsFilter,
  },
  {
    provide: APP_FILTER,
    useClass: DomainHttpExceptionsFilter,
  },
];

@Module({
  imports: [
    configModule,
    CqrsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),

      inject: [ConfigService],
    }),
    // TypeOrmModule.forFeature([User]),
    PassportModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    UserAccountsModule,
    BlogsModule,
  ],
  providers: [...errorFilters],
  exports: [],
})
export class AppModule {}
