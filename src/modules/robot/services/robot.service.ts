import {Injectable, NotFoundException} from "@nestjs/common";
import {firstValueFrom} from "rxjs";
import { HttpService } from '@nestjs/axios';
import {CreateManualDto, CreateRfidDto} from "@modules/robot/dtos/robot.dto";
import {MoreThanOrEqual, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {ProductEntity} from "@modules/products/entities/product.entity";
import {AreaEntity} from "@modules/areas/entities/area.entity";
import {BatchEntity} from "@modules/areas/entities/batch.entity";

@Injectable()
export class RobotService {
    constructor(
        @InjectRepository(ProductEntity)
        private productRepo: Repository<ProductEntity>,
        @InjectRepository(AreaEntity)
        private areaRepo: Repository<AreaEntity>,
        @InjectRepository(BatchEntity)
        private batchRepo: Repository<BatchEntity>,
        private httpService: HttpService,
    ) {}

    async sendCommand(dto: CreateManualDto) {
        const url = `http://172.20.10.5/control?status=${dto.status}`;
        await firstValueFrom(this.httpService.get(url));
    }

    async handleRFID(dto: CreateRfidDto) {
        // 1. Tìm product theo RFID
        const product = await this.productRepo.findOne({ where: { rfid: dto.rfid } });
        if (!product) throw new NotFoundException('Product not found');

        // 2. Lấy address từ product
        const { address } = product;

        // 3. Tìm area theo address
        const area = await this.areaRepo.findOne({ where: { name: address } });
        if (!area) throw new NotFoundException('Area not found');

        // 4. Lấy ngày hiện tại
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 5. Kiểm tra đã có batch hôm nay cho area chưa
        let batch = await this.batchRepo.findOne({
            where: {
                area: { id: area.id },
                created_at: MoreThanOrEqual(today),
            },
            order: { created_at: 'DESC' },
            relations: ['area'],
        });

        // 6. Nếu chưa có, tạo mới
        if (!batch) {
            batch = this.batchRepo.create({
                area_id: area.id,
                created_at: new Date(),
                status: 0,
            });
            await this.batchRepo.save(batch);
        }

        // 7. Update product
        product.status = 1;
        product.batch_id = batch.id;
        await this.productRepo.save(product);

        return {
            message: 'Product updated and added to batch',
            product_id: product.id,
            area_name: area.name,
            position: area.position,
        };
    }
}

