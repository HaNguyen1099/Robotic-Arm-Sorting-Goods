import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {LessThan, MoreThanOrEqual, Repository} from "typeorm";
import { MailerService } from "@nestjs-modules/mailer";
import { AreaEntity } from "@modules/areas/entities/area.entity";
import {ProductEntity} from "@modules/products/entities/product.entity";
import {BatchEntity} from "@modules/areas/entities/batch.entity";

@Injectable()
export class EmailService {
    constructor(
        private readonly mailerService: MailerService,
        @InjectRepository(AreaEntity)
        private areaRepo: Repository<AreaEntity>,
        @InjectRepository(ProductEntity)
        private productRepo: Repository<ProductEntity>,
        @InjectRepository(BatchEntity)
        private batchRepo: Repository<BatchEntity>,
    ) {}

    async sendDailyEmail() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const batches = await this.batchRepo.find({
            where: {
                created_at: MoreThanOrEqual(today),
            },
            relations: ['area'],
        });

        for (const batch of batches) {
            const products = await this.productRepo.find({
                where: { batch_id: batch.id },
            });

            if (products.length === 0) continue;

            const to = batch.area.email;
            const name = batch.area.name;

            await this.mailerService.sendMail({
                to,
                subject: `📦 Thông báo hàng hóa ngày ${today.toLocaleDateString('vi-VN')} – ${name}`,
                template: './email',
                context: {
                    area: name,
                    date: today.toLocaleDateString('vi-VN'),
                    productList: products.map(p => ({
                        name: p.name,
                        address: p.address,
                    })),
                },
            });
        }
    }
}