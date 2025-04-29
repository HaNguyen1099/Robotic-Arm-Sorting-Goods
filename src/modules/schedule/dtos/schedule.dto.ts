import {IsNotEmpty, IsNumber, Max, Min} from "class-validator";
import {ApiProperty, PartialType} from "@nestjs/swagger";

export class CreateScheduleDto {
    @ApiProperty({ example: '10' })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(23)
    hour: number

    @ApiProperty({ example: '0' })
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @Max(59)
    minute: number
}

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {}