import { Module } from "@nestjs/common";
import {RobotController} from "@modules/robot/controllers/robot.controller";
import {RobotService} from "@modules/robot/services/robot.service";
import {HttpModule} from "@nestjs/axios";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ProductEntity} from "@modules/products/entities/product.entity";
import {AreaEntity} from "@modules/areas/entities/area.entity";
import {BatchEntity} from "@modules/areas/entities/batch.entity";
import {SocketService} from "@modules/robot/services/socket.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductEntity, AreaEntity, BatchEntity]),
        HttpModule,
    ],
    controllers: [RobotController],
    providers: [RobotService, SocketService],
})

export class RobotModule {};