export class ColumnNumericTransformer {
  to(data: number): string {
    return (Math.round(data * 100) / 100).toFixed(2);
  }

  from(data: string): number {
    return parseFloat(data);
  }
}
