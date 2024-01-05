export function sendResponse(res, statusCode, data) {
  res.status(statusCode).json(data);
}
