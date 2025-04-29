import {IsNotEmpty, IsNumber, IsString} from "class-validator";
import {ApiProperty, PartialType} from "@nestjs/swagger";

export class CreateAreaDto {
    @ApiProperty({ example: 'Hà Đông' })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ example: 'nnha.1099@gmail.com' })
    @IsString()
    @IsNotEmpty()
    email: string

    @ApiProperty({ example: '1' })
    @IsNumber()
    @IsNotEmpty()
    position: number
}

export class UpdateAreaDto extends PartialType(CreateAreaDto) {}