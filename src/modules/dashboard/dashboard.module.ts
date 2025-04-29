import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {BatchEntity} from "@modules/areas/entities/batch.entity";
import {DashboardController} from "@modules/dashboard/controllers/dashboard.controller";
import {DashboardService} from "@modules/dashboard/services/dashboard.service";
import {AreaEntity} from "@modules/areas/entities/area.entity";

@Module({
    imports: [TypeOrmModule.forFeature([BatchEntity, AreaEntity])],
    controllers: [DashboardController],
    providers: [DashboardService],
})

export class DashboardModule{};