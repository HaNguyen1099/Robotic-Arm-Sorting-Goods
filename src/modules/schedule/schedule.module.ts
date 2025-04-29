import { Module } from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ScheduleEntity} from "@modules/schedule/entities/schedule.entity";
import {ScheduleController} from "@modules/schedule/controllers/schedule.controller";
import {ScheduleService} from "@modules/schedule/services/schedule.service";
import {HttpModule} from "@nestjs/axios";
import {ScheduleTask} from "@modules/schedule/schedule.task";
import {BatchEntity} from "@modules/areas/entities/batch.entity";
import {ProductEntity} from "@modules/products/entities/product.entity";
import {AreaEntity} from "@modules/areas/entities/area.entity";
import {EmailService} from "@modules/schedule/services/email.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ScheduleEntity, BatchEntity, ProductEntity, AreaEntity]),
        HttpModule,
    ],
    controllers: [ScheduleController],
    providers: [ScheduleService, EmailService, ScheduleTask],
})

export class ScheduleAutoModule {};