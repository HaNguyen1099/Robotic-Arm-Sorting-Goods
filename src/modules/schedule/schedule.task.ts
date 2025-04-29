import {Injectable} from "@nestjs/common";
import {Cron} from "@nestjs/schedule";
import {ScheduleService} from "@modules/schedule/services/schedule.service";
import {EmailService} from "@modules/schedule/services/email.service";

@Injectable()
export class ScheduleTask {
    constructor(
        private readonly scheduleService: ScheduleService,
        private readonly emailService: EmailService
    ) {}

    @Cron('* * * * *') // mỗi phút
    handleCron() {
        this.scheduleService.checkAndTrigger();
    }

    @Cron('00 08 17 * * *')
    async handleEmailNotify() {
        await this.emailService.sendDailyEmail();
    }
}
