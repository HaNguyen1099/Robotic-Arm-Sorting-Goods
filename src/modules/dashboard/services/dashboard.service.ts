import { Injectable} from "@nestjs/common";
import {BatchEntity} from "@modules/areas/entities/batch.entity";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {AreaEntity} from "@modules/areas/entities/area.entity";

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(BatchEntity)
        private readonly batchRepo: Repository<BatchEntity>,
        @InjectRepository(AreaEntity)
        private readonly areaRepo: Repository<AreaEntity>,
    ) {}

    async getList() {
        // Lấy danh sách tất cả các area trước
        const allAreas = await this.areaRepo.find(); // đảm bảo repo được inject

        const batches = await this.batchRepo
            .createQueryBuilder('batch')
            .leftJoinAndSelect('batch.area', 'area')
            .leftJoinAndSelect('batch.products', 'product')
            .orderBy('batch.created_at', 'DESC')
            .getMany();

        const historyMap = new Map<string, Map<number, any>>(); // Map<dateStr, Map<areaId, areaData>>

        for (const batch of batches) {
            const dateStr = batch.created_at.toISOString().split('T')[0];

            if (!historyMap.has(dateStr)) {
                historyMap.set(dateStr, new Map<number, any>());
            }

            const areaMap = historyMap.get(dateStr);

            let area = areaMap.get(batch.area.id);
            if (!area) {
                area = {
                    ...batch.area,
                    status: batch.status,
                    products: [],
                };
                areaMap.set(batch.area.id, area);
            }

            for (const product of batch.products) {
                area.products.push(product);
            }
        }

        // Tạo lịch sử, đảm bảo mỗi ngày đều có đủ area
        const history = Array.from(historyMap.entries()).map(([date, areaMap]) => {
            const areas = allAreas.map((a) => {
                const existingArea = areaMap.get(a.id);
                return existingArea || {
                    ...a,
                    status: null,
                    products: [],
                };
            });

            // Sắp xếp theo id
            areas.sort((a, b) => a.id - b.id);

            return { date, areas };
        });

        return history;
    }

}
