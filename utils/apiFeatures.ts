import { Query } from 'mongoose';
import AppError from './appError';

/**
 * @class APIFeatures
 * @param query an empty query of the desired collection
 * @param reqQuery the query object including all desired fields:
 * {
 *   sort?: 'sortOption1,sortOptions2...',
 *   fields: 'fieldToShow1,fieldToShow2...'
 *   limit?: number,
 *   page?: number,
 *   ...other filtering fields
 * }
 *
 * allow filter, sort, field limitation and pagination to any queries of any type
 */
class APIFeatures<T> {
  public query: Query<T[], T>;
  public reqQuery: any;

  constructor(query: Query<T[], T>, reqQuery: any) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter() {
    const queryObj = { ...this.reqQuery }; // extract query object
    // remove unawnted filter fields
    ['sort', 'limit', 'page', 'fields'].forEach((el) => delete queryObj[el]);

    // replace operators with valid mongoBD operators (add $ at start of operator)
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    // filter doc and return the new query
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // check if sort exists on reqQuery if not simply sort by creation date
    if (this.reqQuery.sort) {
      if (typeof this.reqQuery.sort != 'string')
        throw new AppError('Invalid sort field', 500);
      this.query = this.query.sort(this.reqQuery.sort.split(',').join(' '));
    } else this.query = this.query.sort('-createdAt');

    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      if (typeof this.reqQuery.fields != 'string')
        throw new AppError('Invalid fields', 500);
      this.query = this.query.select(this.reqQuery.fields.split(',').join(' '));
    } else this.query = this.query.select('-__v');

    return this;
  }

  paginate() {
    const page: number = +(this.reqQuery.page || 1);
    const limit: number = +(this.reqQuery.limit || 100);
    const skip = (page - 1) * limit;
    this.query.skip(skip).limit(limit);

    return this;
  }
}

export default APIFeatures;
