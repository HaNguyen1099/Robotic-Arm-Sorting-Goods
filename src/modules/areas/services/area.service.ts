import { Injectable} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {AreaEntity} from "@modules/areas/entities/area.entity";
import {BatchEntity} from "@modules/areas/entities/batch.entity";
import {BaseCrudService} from "@base/services/base-crud.service";

@Injectable()
export class AreaService extends BaseCrudService<AreaEntity>{
    constructor(
        @InjectRepository(AreaEntity)
        private readonly areaRepo: Repository<AreaEntity>,
        @InjectRepository(BatchEntity)
        private readonly batchRepo: Repository<BatchEntity>,
    ) {
        super(areaRepo, "AreaService");
    }
}
