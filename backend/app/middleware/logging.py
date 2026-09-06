import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
import uuid

logger = logging.getLogger("app.middleware")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        # Log request
        logger.info(f"Incoming request: {request.method} {request.url.path} (ID: {request_id})")
        
        try:
            response = await call_next(request)
            
            # Log response
            process_time = (time.time() - start_time) * 1000
            logger.info(f"Completed request: {request.method} {request.url.path} (ID: {request_id}) - Status: {response.status_code} - {process_time:.2f}ms")
            
            # Add custom header
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = f"{process_time:.2f} ms"
            return response
            
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(f"Failed request: {request.method} {request.url.path} (ID: {request_id}) - Error: {str(e)} - {process_time:.2f}ms", exc_info=True)
            raise e
