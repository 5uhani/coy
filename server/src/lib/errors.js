export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export class ValidationError extends HttpError {
  constructor(message) { super(400, message); }
}
export class NotFoundError extends HttpError {
  constructor(message = 'Not found') { super(404, message); }
}
export class DuplicateSwipeError extends HttpError {
  constructor() { super(409, 'You have already swiped on this profile'); }
}
