import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, ValidationPipe } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {ProductService} from "@modules/products/services/product.service";
import {CreateProductDto, UpdateProductDto} from "@modules/products/dtos/product.dto";

@ApiTags('Product')
@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {};

    @Post()
    @ApiOperation({ summary: 'Create new product' })
    create(@Body() dto: CreateProductDto) {
        return this.productService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get list products' })
    async getList(){
        return this.productService.getAll();
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get detail product' })
    async detail(@Param('id') id: number) {
        return this.productService.findOne({ id });
    }

    @Patch('/:id')
    @ApiOperation({ summary: 'Update product' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProductDto,
    ){
        return this.productService.update({ id }, dto);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete product' })
    async delete(@Param('id') id: number) {
        return this.productService.delete(id);
    }
}