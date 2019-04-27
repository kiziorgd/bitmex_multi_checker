FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

COPY ./bitmex_api_service /app
COPY ./requirements.txt /app

RUN pip install -r /app/requirements.txt

ENV MODULE_NAME api
ENV PORT 8291