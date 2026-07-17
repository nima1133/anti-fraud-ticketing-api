// utils/apiFeatures.ts

export class ApiFeatures {
  private queryOptions: Record<string, any> = {};

  constructor(private query: Record<string, any>) {}

  filter() {
    const queryObj = { ...this.query };

    const excludedFields = ['page', 'limit', 'sort'];
    excludedFields.forEach((field) => delete queryObj[field]);

    if (queryObj.userId) queryObj.userId = Number(queryObj.userId);
    if (queryObj.entityId) queryObj.entityId = Number(queryObj.entityId);

    this.queryOptions.where = queryObj;

    return this;
  }

  sort() {
    if (!this.query.sort) return this;

    const sortBy = String(this.query.sort);

    if (sortBy.startsWith('-')) {
      this.queryOptions.orderBy = {
        [sortBy.slice(1)]: 'desc',
      };
    } else {
      this.queryOptions.orderBy = {
        [sortBy]: 'asc',
      };
    }

    return this;
  }

  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    this.queryOptions.skip = (page - 1) * limit;
    this.queryOptions.take = limit;

    return this;
  }

  build() {
    return this.queryOptions;
  }
}
