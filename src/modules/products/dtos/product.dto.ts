import {IsNotEmpty, IsNumber, IsString, Max, Min} from "class-validator";
import {ApiProperty, PartialType} from "@nestjs/swagger";

export class CreateProductDto {
    @ApiProperty({ example: 'Iphone XS' })
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ example: 'ABC111' })
    @IsString()
    @IsNotEmpty()
    rfid: string

    @ApiProperty({ example: 'Hà Đông' })
    @IsString()
    @IsNotEmpty()
    address: string
}

export class UpdateProductDto extends PartialType(CreateProductDto) {};