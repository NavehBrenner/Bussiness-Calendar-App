import { NextFunction, Request, Response } from 'express';

// catch API ONLY async functions mechanism, symply wrap function in catchAsync(fn) and no need to worry about try and catch
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => any
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
