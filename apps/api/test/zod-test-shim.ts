type ParseResult = { success: true; data: any } | { success: false; error: { issues: string[] } };

class Schema {
  constructor(private readonly validator: (v: any) => boolean) {}

  safeParse(value: any): ParseResult {
    if (this.validator(value)) {
      return { success: true, data: value };
    }
    return { success: false, error: { issues: ['invalid'] } };
  }

  optional() {
    return new Schema((v) => v === undefined || this.validator(v));
  }
  default(_v: any) {
    return this;
  }
  min(_n: number) {
    return this;
  }
  max(_n: number) {
    return this;
  }
  int() {
    return this;
  }
  positive() {
    return this;
  }
  nonnegative() {
    return this;
  }
}

const stringSchema = () => new Schema((v) => typeof v === 'string');
const numberSchema = () => new Schema((v) => typeof v === 'number' && !Number.isNaN(v));
const booleanSchema = () => new Schema((v) => typeof v === 'boolean');
const literalSchema = (value: any) => new Schema((v) => v === value);
const enumSchema = (values: string[]) => new Schema((v) => typeof v === 'string' && values.includes(v));
const arraySchema = (schema: Schema) => new Schema((v) => Array.isArray(v) && v.every((i) => schema.safeParse(i).success));
const objectSchema = (shape: Record<string, Schema>) =>
  new Schema((v) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
    return Object.entries(shape).every(([k, s]) => s.safeParse((v as any)[k]).success);
  });
const recordSchema = (_k: Schema, vSchema: Schema) =>
  new Schema((v) =>
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    Object.values(v).every((item) => vSchema.safeParse(item).success),
  );

export const z = {
  object: objectSchema,
  string: stringSchema,
  number: numberSchema,
  boolean: booleanSchema,
  enum: enumSchema,
  literal: literalSchema,
  array: arraySchema,
  record: recordSchema,
  any: () => new Schema(() => true),
};
