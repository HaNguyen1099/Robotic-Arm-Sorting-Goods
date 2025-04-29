import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, ValidationPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {CreateScheduleDto, UpdateScheduleDto} from "@modules/schedule/dtos/schedule.dto";
import {ScheduleService} from "@modules/schedule/services/schedule.service";

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) {};

    @Post()
    @ApiOperation({ summary: 'Create automatic schedule' })
    async create(@Body() dto: CreateScheduleDto) {
        return await this.scheduleService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get list automatic schedule' })
    async getList(){
        return await this.scheduleService.getAll();
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get detail automatic schedule' })
    async detail(@Param('id') id: number) {
        return await this.scheduleService.findOne({ id });
    }

    @Patch('/:id')
    @ApiOperation({ summary: 'Update automatic schedule' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateScheduleDto,
    ){
        return await this.scheduleService.update({ id }, dto);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete automatic schedule' })
    async delete(@Param('id') id: number) {
        return await this.scheduleService.delete(id);
    }
}