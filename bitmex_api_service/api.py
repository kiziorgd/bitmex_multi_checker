from typing import List
from bitmex import bitmex
from fastapi import FastAPI
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware


class ApiCreds(BaseModel):
    api_key: str
    api_secret: str


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.post("/users/data")
async def get_all_users_data(api_creds: List[ApiCreds]):
    return [get_user_data(**api.dict()) for api in api_creds]


def get_user_data(api_key='', api_secret=''):
    client = bitmex(test=False, api_key=api_key, api_secret=api_secret)

    user = client.User

    user_basic = user.User_get().result()[0]
    user_affiliate = user.User_getAffiliateStatus().result()[0]
    user_wallet = user.User_getWallet().result()[0]
    position = client.Position.Position_get(filter='{"symbol":"XBTUSD"}').result()[0]

    result = {
        "username": user_basic["username"],
        "balance": user_wallet['amount'],
        "position": position[0]['currentQty'] if position else 0,
        "sellOrders": position[0]['openOrderSellQty'] if position else 0,
        "deposited": user_wallet['deposited'],
        "withdrawn": user_wallet['withdrawn'],
        "referer": int(user_affiliate['referrerAccount']) if user_affiliate['referrerAccount'] else '-'
    }

    return result
