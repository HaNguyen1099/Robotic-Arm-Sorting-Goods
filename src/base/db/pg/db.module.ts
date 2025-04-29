import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource, getDataSourceByName } from 'typeorm-transactional';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';

import { config } from '@config';
import { typeOrmOptionsGenerate } from '@ormconfig';

const typeOrmOptions: TypeOrmModuleAsyncOptions[] = [
  {
    useFactory: () =>
        ({
          ...typeOrmOptionsGenerate(config),
          synchronize: true,
          maxQueryExecutionTime: config.DB_MAX_QUERY_EXECUTION_TIME,
        } as TypeOrmModuleOptions),
    async dataSourceFactory(options: DataSourceOptions) {
      if (!options) throw new Error('Invalid options passed');
      return getDataSourceByName('default') || addTransactionalDataSource(new DataSource(options));
    },
  },
];

export const appDataSource = new DataSource({
  type: config.DB_TYPE,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  logging: true,
});

@Module({
  imports: [...typeOrmOptions.map((options) => TypeOrmModule.forRootAsync(options))],
})
export class DatabaseModule implements OnModuleInit {
  async onModuleInit() {
    await appDataSource.initialize();
    void appDataSource.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
  }
}
