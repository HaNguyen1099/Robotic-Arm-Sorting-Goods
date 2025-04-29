import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {DashboardService} from "@modules/dashboard/services/dashboard.service";

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController{
    constructor(
        private readonly dashboardService: DashboardService
    ) {};

    @Get()
    @ApiOperation({ summary: 'Get list dashboard' })
    async getHistory() {
        return this.dashboardService.getList();
    }
}