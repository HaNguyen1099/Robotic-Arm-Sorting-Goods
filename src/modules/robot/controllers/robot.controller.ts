import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {RobotService} from "@modules/robot/services/robot.service";
import {CreateManualDto, CreateRfidDto} from "@modules/robot/dtos/robot.dto";
import {SocketService} from "@modules/robot/services/socket.service";

@ApiTags('Robot')
@Controller('robot')
export class RobotController {
    constructor(
        private readonly robotService: RobotService,
        private readonly socketService: SocketService,
    ) {};

    @Post('/control-manual')
    @ApiOperation({ summary: 'Control manual' })
    async manualControl(@Body() dto: CreateManualDto) {
        await this.robotService.sendCommand(dto);
        return { message: 'Command control sent to robot' };
    }

    @Post('/rfid')
    @ApiOperation({ summary: 'Get RFID from ESP32' })
    async handleRFID(@Body() dto: CreateRfidDto) {
        return await this.robotService.handleRFID(dto);
    }

    @Post('sort')
    @ApiOperation({ summary: 'Sort goods done' })
    async handleSortDone(@Body() body: { status: number }) {
        // Gửi thông báo lên frontend
        this.socketService.notify();

        return {
            success: true,
            message: 'Đã nhận tín hiệu phân loại xong',
        }
    }
}