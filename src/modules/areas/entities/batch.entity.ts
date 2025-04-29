import {Entity, Column, ManyToOne, JoinColumn, OneToMany} from "typeorm";
import {BaseEntity} from "@base/entities/base.entity";
import {AreaEntity} from "@modules/areas/entities/area.entity";
import {ProductEntity} from "@modules/products/entities/product.entity";

@Entity('batches')
export class BatchEntity extends BaseEntity {
    @Column({ nullable: true })
    area_id: number;

    @Column({ nullable: true })
    status: number;

    @ManyToOne(() => AreaEntity, (area) => area.batches)
    @JoinColumn({ name: 'area_id' })
    area: AreaEntity;

    @OneToMany(() => ProductEntity, (product) => product.batch)
    products: ProductEntity[];
}