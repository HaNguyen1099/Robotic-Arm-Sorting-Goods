import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {BaseCrudService} from "@base/services/base-crud.service";
import {ProductEntity} from "@modules/products/entities/product.entity";

@Injectable()
export class ProductService extends BaseCrudService<ProductEntity>{
    constructor(
        @InjectRepository(ProductEntity)
        private productRepo: Repository<ProductEntity>,
    ) {
        super(productRepo, "ProductService");
    }
}
