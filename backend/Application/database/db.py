from flask_mongoengine import MongoEngine # type: ignore

db = MongoEngine()

def initialize_db(app):
    db.init_app(app)

