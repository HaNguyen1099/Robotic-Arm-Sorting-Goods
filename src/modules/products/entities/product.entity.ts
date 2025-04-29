import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {BaseEntity} from "@base/entities/base.entity";
import {BatchEntity} from "@modules/areas/entities/batch.entity";
import {AreaEntity} from "@modules/areas/entities/area.entity";

@Entity('products')
export class ProductEntity extends BaseEntity {
    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    address: string;

    @Column({ nullable: false })
    rfid: string;

    @Column({ nullable: true })
    status: number;

    @Column({ nullable: true })
    batch_id: number;

    @ManyToOne(() => BatchEntity, (batch) => batch.products)
    @JoinColumn({ name: 'batch_id' })
    batch: BatchEntity;
}