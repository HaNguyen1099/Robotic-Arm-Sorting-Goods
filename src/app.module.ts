import {Module} from "@nestjs/common";
import {AreaModule} from "@modules/areas/area.module";
import {ProductModule} from "@modules/products/product.module";
import {config, ConfigModule} from "@config";
import {DatabaseModule} from "@base/db/pg/db.module";
import {MailerModule} from "@nestjs-modules/mailer";
import {join} from "path";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import {LoggingModule} from "@base/logging/logging.module";
import {ScheduleAutoModule} from "@modules/schedule/schedule.module";
import {RobotModule} from "@modules/robot/robot.module";
import { ScheduleModule } from '@nestjs/schedule';
import {DashboardModule} from "@modules/dashboard/dashboard.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),

    // globalModule
    ConfigModule,
    LoggingModule,

    // coreModules
    DatabaseModule,
    MailerModule.forRoot({
      transport: {
        host: config.EMAIL_HOST,
        secure: false,
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <config.EMAIL_FROM_ADDRESS>',
      },
      template: {
        dir: join(process.cwd(), 'src/base/email/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    // appModules
    DashboardModule,
    AreaModule,
    ProductModule,
    ScheduleAutoModule,
    RobotModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
