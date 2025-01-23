import { Logger } from '@nestjs/common';
import http from 'http';

export function parseSearchString(searchString?: string) {
  if (!searchString) {
    return [];
  }

  return Array.from(new URLSearchParams(searchString).entries()).map(
    ([k, v]) => ({ [k]: v }),
  );
}

export function parseData(headers: Record<string, any>, chunks: any[]) {
  const contentType =
    headers['Content-Type'] || headers['content-type'] || 'ignore';

  const [firstChunk] = chunks ?? [];
  let rawData: any;
  if (typeof firstChunk === 'string') {
    rawData = firstChunk;
  } else {
    rawData = Buffer.concat(chunks).toString();
  }
  if (contentType.toLowerCase().includes('application/json')) {
    return JSON.parse(rawData);
  }
  return rawData;
}

export function logRequest(
  req: http.ClientRequest,
  requestChunks: any[],
  logger: Logger,
) {
  const getLogMethod = () => 'log';
  const logMethod = getLogMethod();
  const [url, searchString] = req.path.split('?');
  const query = parseSearchString(searchString);
  const requestHeaders = req.getHeaders();
  const body = parseData(requestHeaders, requestChunks);
  const request = {
    method: req.method,
    baseURL: `${req.protocol}//${req.host}`,
    path: req.path,
    url,
    query,
    headers: requestHeaders,
    body,
  };
  logger[logMethod]({
    message: `[HTTP] [OUTBOUND] [REQUEST] [${req.method}] [${url}]`,
    request,
  });
  return request;
}

export function logResponse(
  res: http.IncomingMessage,
  responseChunks: any[],
  logger: Logger,
  error?: Error,
) {
  const {
    statusCode: status,
    statusMessage: statusText,
    headers: responseHeaders,
  } = res;
  const getLogMethod = () => {
    if (error) return 'error';
    if (status >= 400) return 'warn';
    return 'log';
  };
  const getErrorIfNeeded = () => {
    if (error) return { error };
    return {};
  };
  const logMethod = getLogMethod();

  const { request, executionStartTimestamp } = (res as any).req['__META__'];
  const executionTimeMillis = `${Date.now() - executionStartTimestamp}ms`;

  logger[logMethod]({
    message: `[HTTP] [OUTBOUND] [RESPONSE] [${request.method}] [${request.url}] [${status}] [${executionTimeMillis}]`,
    executionTimeMillis,
    ...getErrorIfNeeded(),
    request,
    response: {
      status,
      statusText,
      headers: responseHeaders,
      body: parseData(responseHeaders, responseChunks),
    },
  });
}

export function logRequestError(
  req: http.ClientRequest,
  requestDataChunks: any[],
  logger: Logger,
  error: Error,
) {
  const [url, searchString] = req.path.split('?');
  const headers = req.getHeaders();
  logger.warn({
    message: `[HTTP] [OUTBOUND] [${req.method}] [${url}] [${error.message}]`,
    error,
    request: {
      method: req.method,
      url,
      query: parseSearchString(searchString),
      headers: req.getHeaders(),
      body: parseData(headers, requestDataChunks),
    },
  });
}

export const routeToRegex = (x: string) =>
  new RegExp(`^${x.replaceAll('.', '\\.').replaceAll('*', '.*')}$`, 'i');
