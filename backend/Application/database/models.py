from bson.objectid import ObjectId
from mongoengine import *
from .db import db

class User(Document):
    username = StringField(required=True, unique=True)
    password = StringField(required=True)
    isAdmin = BooleanField(default=False)

class Device(Document):
    deviceName = StringField(required=True, unique=True)
    group = StringField(required=True)
    powerOnTime = StringField(required=True)  # format: "HH:MM"
    powerOffTime = StringField(required=True)  # format: "HH:MM"
    count = IntField(required=True, default=1)  # câte dispozitive de acest tip
    consumptionPerHour = FloatField(required=True)  # kWh per hour

class DailySaving(EmbeddedDocument):
    subId = ObjectIdField(required=True, default=lambda: ObjectId())
    date = StringField(required=True)  # "2025-07-17"
    hoursOff = FloatField(required=True)  # ore cât a fost oprit
    energySaved = FloatField(required=True)  # kWh economisiti

class Saving(Document):
    deviceName = StringField(required=True, unique=True)
    log = EmbeddedDocumentListField(DailySaving)