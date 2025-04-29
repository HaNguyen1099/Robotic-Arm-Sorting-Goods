import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {AreaEntity} from "@modules/areas/entities/area.entity";
import {BatchEntity} from "@modules/areas/entities/batch.entity";
import {AreaController} from "@modules/areas/controllers/area.controller";
import {AreaService} from "@modules/areas/services/area.service";

@Module({
    imports: [TypeOrmModule.forFeature([AreaEntity, BatchEntity])],
    controllers: [AreaController],
    providers: [AreaService],
})

export class AreaModule {};