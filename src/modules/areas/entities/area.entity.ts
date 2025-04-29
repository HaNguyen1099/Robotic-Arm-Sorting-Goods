import {Entity, Column, OneToMany} from "typeorm";
import {BaseEntity} from "@base/entities/base.entity";
import {BatchEntity} from "@modules/areas/entities/batch.entity";

@Entity('areas')
export class AreaEntity extends BaseEntity {
    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    email: string;

    @Column()
    position: number;

    @OneToMany(() => BatchEntity, (batch) => batch.area)
    batches: BatchEntity[];
}