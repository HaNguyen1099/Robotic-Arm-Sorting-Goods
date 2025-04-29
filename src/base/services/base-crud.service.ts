import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial,FindOptionsOrder,SelectQueryBuilder } from "typeorm";
import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import * as _ from "lodash";
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {BaseQueryDto, PaginationDto} from "@base/dtos/common.dto";

@Injectable()
export class BaseCrudService<T> {
    constructor(
        private readonly repository: Repository<T>,
        private readonly serviceName: string,
    ) {}

    protected async preCreate(dto: DeepPartial<T>): Promise<DeepPartial<T>> {
        return dto;
    }

    protected async preUpdate(
        oldData: T,
        dto: DeepPartial<T>,
    ): Promise<DeepPartial<T>> {
        return dto;
    }

    async create(dto: DeepPartial<T>): Promise<T> {
        try {
            const processedData = await this.preCreate(dto);

            const sanitizedData = Object.entries(processedData).reduce(
                (acc, [key, val]) => {
                    // Bỏ qua nếu là số và là NaN
                    if (typeof val === 'number' && isNaN(val)) return acc;
                    // Bỏ qua nếu là null hoặc undefined
                    if (val === null || val === undefined) return acc;

                    acc[key] = val;
                    return acc;
                },
                {} as Record<string, any>,
            );

            const filteredData = _.pick(sanitizedData, Object.keys(dto)) as DeepPartial<T>;

            const entity = this.repository.create(filteredData);
            return await this.repository.save(entity);
        } catch (error) {
            throw new InternalServerErrorException('Error creating entity');
        }
    }


    async update(options: FindOptionsWhere<T>, data: DeepPartial<T>): Promise<T> {
        try {
            const oldData = await this.findOne(options);

            const sanitizedData = Object.entries(data).reduce(
                (acc, [key, val]) => {
                    if (typeof val === 'number' && isNaN(val)) {
                        acc[key] = null;
                    }
                    else if (val === 'null' || val === null || val === undefined) {
                        acc[key] = null;
                    }
                    else {
                        acc[key] = val;
                    }
                    return acc;
                },
                {} as Record<string, any>,
            ) as DeepPartial<T>;
            await this.repository.update(options, sanitizedData as QueryDeepPartialEntity<T>);
            return await this.findOne(options);
        } catch (error) {
            throw new InternalServerErrorException('Error updating entity');
        }
    }

    async findOne(where: FindOptionsWhere<T>): Promise<T> {
        const entity = await this.repository.findOne({ where });
        if (!entity) {
            throw new NotFoundException('Entity not found');
        }
        return entity;
    }

    baseQuery<T, G>(
        queryBuilder: SelectQueryBuilder<T>,
        query: Partial<G>,
        alias: string,
    ) {
        const getColumnAlias = (key: string, defaultAlias: string) => {
            const parts = key.split('.');
            if (parts.length === 1) return `${defaultAlias}.${parts[0]}`;
            const column = parts.pop();
            const joinedAlias = parts.join('.');
            return `${joinedAlias}.${column}`;
        };

        Object.entries(query)
            .filter(([_, value]) => value !== undefined && value !== null && value !== '')
            .forEach(([key, value], index) => {
                const paramKey = `value${index}`;
                const column = getColumnAlias(key, alias);

                const isExactIdField = key === 'id' || key.endsWith('_id');

                if (Array.isArray(value)) {
                    const isJsonArrayField = key === 'role';
                    if (isJsonArrayField) {
                        const conditions = value.map((val, i) => `JSON_CONTAINS(${column}, :jsonVal${i})`).join(' OR ');
                        const params = value.reduce((acc, val, i) => {
                            acc[`jsonVal${i}`] = `"${val}"`;
                            return acc;
                        }, {});
                        queryBuilder.andWhere(conditions, params);
                    } else {
                        const isAllNumber = value.every((v) => !isNaN(Number(v)));
                        if (isAllNumber) {
                            queryBuilder.andWhere(`${column} IN (:...${paramKey})`, {
                                [paramKey]: value.map((v) => Number(v)),
                            });
                        } else {
                            queryBuilder.andWhere(`${column} IN (:...${paramKey})`, {
                                [paramKey]: value,
                            });
                        }
                    }
                }
                else if (isExactIdField && !isNaN(Number(value))) {
                    queryBuilder.andWhere(`${column} = :${paramKey}`, {
                        [paramKey]: Number(value),
                    });
                } else {
                    queryBuilder.andWhere(`${column} LIKE :${paramKey}`, {
                        [paramKey]: `%${(value.toString().trim())}%`,
                    });
                }
            });

        return queryBuilder;
    }



    async sortAndPaginate(
        queryBuilder: SelectQueryBuilder<T>,
        filters: BaseQueryDto,
        alias: string
    ) {
        try {
            let sortColumn: string;
            let sortOrder: "ASC" | "DESC" = ["ASC", "DESC"].includes(filters.orderByDirection) ? filters.orderByDirection : "DESC";

            if (filters.orderByColumn) {
                const sanitizedColumn = filters.orderByColumn.replace(/['"]/g, '').trim();
                const [columnAlias, columnName] = sanitizedColumn.includes('.')
                    ? sanitizedColumn.split('.')
                    : [alias, sanitizedColumn];

                const isAliasExists = queryBuilder.expressionMap.aliases.some(a => a.name === columnAlias);

                if (isAliasExists) {
                    sortColumn = `${columnAlias}.${columnName}`;
                } else {
                    sortColumn = `${alias}.updated_at`;
                }
            } else {
                sortColumn = `${alias}.updated_at`;
            }

            queryBuilder.addOrderBy(sortColumn.trim(), sortOrder);

            try {
                return await this.paginate(queryBuilder, filters);
            } catch (queryError) {
                return { data: [], total: 0 };
            }
        } catch (error) {
            throw new InternalServerErrorException('Error sorting and paginating data');
        }
    }

    protected async paginate(
        queryBuilder: SelectQueryBuilder<T>,
        filters: BaseQueryDto
    ) {
        try {
            const { page = 1, per_page = 20 } = filters;

            const [data, total] = await queryBuilder
                .skip((page - 1) * per_page)
                .take(per_page)
                .getManyAndCount();

            return new PaginationDto(page, per_page, total, data);
        } catch (error) {
            throw new InternalServerErrorException('Error applying pagination');
        }
    }


    async findAll<G>(filters: G) {
        try {
            const { orderByColumn, orderByDirection, page, per_page, ...filter } = filters as any;

            const queryBuilder = this.repository.createQueryBuilder('entity');

            this.baseQuery(queryBuilder, filter, 'entity');

            return await this.sortAndPaginate(queryBuilder, filters, 'entity');
        } catch (error) {
            throw new InternalServerErrorException('Error fetching data');
        }
    }

    protected async preDelete(oldData: T): Promise<void> {}

    async delete(id: number): Promise<void> {
        try {
            const oldData = await this.findOne({ id } as unknown as FindOptionsWhere<T>);

            await this.preDelete(oldData);
            const result = await this.repository.delete(id);
            if (!result.affected) {
                throw new NotFoundException('Entity not found');
            }
        } catch (error) {
            throw new InternalServerErrorException('Error deleting entity');
        }
    }

    async deleteMany(ids: number[]): Promise<void> {
        try {
            await this.repository.delete(ids);
        } catch (error) {
            throw new InternalServerErrorException(
                'Error deleting multiple entities',
            );
        }
    }

    async getAll(): Promise<T[]> {
        try {
            return await this.repository.find({
                order: {
                    ['created_at']: 'ASC',
                } as any,
            });
        } catch (error) {
            throw new InternalServerErrorException('Error fetching all entities');
        }
    }
}