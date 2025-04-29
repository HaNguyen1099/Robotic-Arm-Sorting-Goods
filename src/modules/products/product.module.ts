import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {ProductEntity} from "@modules/products/entities/product.entity";
import {ProductController} from "@modules/products/controllers/product.controller";
import {ProductService} from "@modules/products/services/product.service";

@Module({
    imports: [TypeOrmModule.forFeature([ProductEntity])],
    controllers: [ProductController],
    providers: [ProductService],
})

export class ProductModule {};