import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber, IsString, Max, Min} from "class-validator";

export class CreateManualDto {
    @ApiProperty({ example: '1' })
    @IsNumber()
    @IsNotEmpty()
    status: number;
}

export class CreateRfidDto {
    @ApiProperty({ example: 'ABC123' })
    @IsString()
    @IsNotEmpty()
    rfid: string;
}