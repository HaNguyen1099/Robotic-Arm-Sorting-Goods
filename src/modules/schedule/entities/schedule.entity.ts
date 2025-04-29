import { Entity, Column } from "typeorm";
import {BaseEntity} from "@base/entities/base.entity";

@Entity('schedule')
export class ScheduleEntity extends BaseEntity {
    @Column()
    hour: number;

    @Column()
    minute: number;
}