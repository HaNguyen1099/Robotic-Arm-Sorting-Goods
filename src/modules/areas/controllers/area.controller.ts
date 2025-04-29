import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {AreaService} from "@modules/areas/services/area.service";
import {CreateAreaDto, UpdateAreaDto} from "@modules/areas/dtos/area.dto";

@ApiTags('Area')
@Controller('area')
export class AreaController {
    constructor(
        private readonly areaService: AreaService
    ) {};

    @Post()
    @ApiOperation({ summary: 'Create new area' })
    create(@Body() dto: CreateAreaDto) {
        return this.areaService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get list area' })
    async getList(){
        return this.areaService.getAll();
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get detail area' })
    async detail(@Param('id') id: number) {
        return this.areaService.findOne({ id });
    }

    @Patch('/:id')
    @ApiOperation({ summary: 'Update area' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAreaDto,
    ){
        return this.areaService.update({ id }, dto);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete area' })
    async delete(@Param('id') id: number) {
        return this.areaService.delete(id);
    }
}