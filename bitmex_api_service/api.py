from typing import List
from bitmex import bitmex
from fastapi import FastAPI
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from json import dumps


class ApiCreds(BaseModel):
    api_key: str
    api_secret: str
    api_hedge_contract: str


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


def get_user_data(api_key='', api_secret='', api_hedge_contract=''):
    client = bitmex(test=False, api_key=api_key, api_secret=api_secret)

    user = client.User

    user_basic = user.User_get().result()[0]
    user_affiliate = user.User_getAffiliateStatus().result()[0]
    user_wallet = user.User_getWallet().result()[0]
    user_margin = user.User_getMargin().result()[0]
    position = client.Position.Position_get(filter=dumps({'symbol': 'XBTUSD'})).result()[0]
    hedge = client.Position.Position_get(filter=dumps({'symbol': api_hedge_contract})).result()[0]
    orders = client.Order.Order_getOrders(filter=dumps({'open': True})).response().incoming_response.json()

    result = {
        'username': user_basic['username'],
        'balance': user_margin['walletBalance'],
        'position': position[0]['currentQty'] if position else 0,
        'avgEntryPrice': position[0]['avgEntryPrice'] if position else 0,
        'hedge': hedge[0]['currentQty'] if hedge else 0,
        'hedgeAvgEntryPrice': hedge[0]['avgEntryPrice'] if hedge else 0,
        'sellOrders': position[0]['openOrderSellQty'] if position else 0,
        'deposited': user_wallet['deposited'],
        'withdrawn': user_wallet['withdrawn'],
        'referer': int(user_affiliate['referrerAccount']) if user_affiliate['referrerAccount'] else '-',
        'openOrders': orders
    }

    return result
