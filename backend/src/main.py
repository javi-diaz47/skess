from fastapi import FastAPI

app = FastAPI(title="Skess")


@app.get("/")
def ping():
    return "pong!"
