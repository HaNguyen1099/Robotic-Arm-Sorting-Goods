import { join } from 'path';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmOptionsGenerate = config => ({
  type: config.DB_TYPE,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  synchronize: false,
  logging: true,
  idleTimeoutMillis: 0,
  connectTimeoutMS: 0,
  extra: {
    connectionLimit: 10,
  },
  autoLoadEntities: true,
  cli: { migrationsDir: 'src/migrations' },
  entities: [join(__dirname, './modules/**/*.entity{.ts,.js}')],
  useNewUrlParser: true,
}) as TypeOrmModuleOptions;
