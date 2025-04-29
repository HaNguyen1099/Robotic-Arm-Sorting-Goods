import {IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested} from 'class-validator';
import {Expose, Transform, Type} from "class-transformer";
import { ApiHideProperty, ApiProperty, IntersectionType } from '@nestjs/swagger';

export class MetaDataDto {
    @Expose()
    @Type(() => Number)
    page: number;

    @Expose()
    @IsInt()
    @Min(1)
    @Max(1000)
    @Type(() => Number)
    perPage: number;

    @Expose()
    @Type(() => Number)
    total: number;

    @Expose()
    @Type(() => Number)
    totalPages: number;

    constructor(page: number, perPage: number, total: number) {
        this.page = page ?? 1;
        this.perPage = perPage ?? 20;
        this.total = total ?? 0;
        this.totalPages = Math.ceil(this.total / this.perPage);
    }
}

export class PaginationDto<T> {
    @Expose()
    @ValidateNested()
    @Type(() => MetaDataDto)
    meta: MetaDataDto;

    @Expose()
    data: T[];

    @Expose()
    @IsOptional()
    additionalData: object | null;

    constructor(
        page: number,
        perPage: number,
        total: number,
        data: T[],
        meta?: object | null,
    ) {
        this.meta = new MetaDataDto(page, perPage, total);
        this.data = data;
        this.additionalData = meta;
    }
}

export class SortOptionDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ example: "updated_at", description: "Field to sort by" })
    orderByColumn ?: string;

    @IsOptional()
    @ApiProperty({
        example: "ASC",
        description: "Sort order (ASC or DESC)",
        enum: ["ASC", "DESC"],
    })
    orderByDirection ?: "ASC" | "DESC";
}
export class StorageIdDto {
    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    storage_id: number;
}

export class StorageIdHideDto {
    @IsNumber()
    @IsOptional()
    @ApiHideProperty()
    @Transform(({ value }) => Number(value))
    storage_id?: number;
}

export class IdDto {
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    id?: number;
}


export class BasePaginate {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @ApiProperty({ example: 1, description: "Page number for pagination" })
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    @Max(1000)
    @ApiProperty({ example: 20, description: "Number of items per page" })
    per_page?: number = 20;
}

export class BaseQueryDto extends IntersectionType(SortOptionDto, BasePaginate) {
    @IsOptional()
    @ApiProperty({ example: { status: "active", category: "electronics" }, description: "Filters for querying data" })
    filterCls?: Partial<Record<string, any>>;
}