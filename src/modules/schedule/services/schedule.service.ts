import {firstValueFrom} from "rxjs";
import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {HttpService} from "@nestjs/axios";
import {ScheduleEntity} from "@modules/schedule/entities/schedule.entity";
import {BaseCrudService} from "@base/services/base-crud.service";

@Injectable()
export class ScheduleService extends BaseCrudService<ScheduleEntity>{
    constructor(
        @InjectRepository(ScheduleEntity)
        private scheduleRepo: Repository<ScheduleEntity>,
        private httpService: HttpService,
    ) {
        super(scheduleRepo, "ScheduleService");
    }

    async checkAndTrigger() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        const matches = await this.scheduleRepo.findBy({ hour, minute });

        if (matches.length > 0) {
            console.log(`Triggering robot at ${hour}:${minute}`);
            // Gửi lệnh đến ESP32
            await firstValueFrom(
                this.httpService.get(`http://172.20.10.5/control?status=1`)
            );
        }
    }
}
