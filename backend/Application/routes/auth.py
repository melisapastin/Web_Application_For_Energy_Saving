import configparser
from functools import wraps

from bcrypt import hashpw # type: ignore
from Application import app
from flask import jsonify, make_response, request # type: ignore
import jwt # type: ignore
from flask_cors import CORS

from Application.database.models import User
from datetime import datetime, timedelta
from flask_jwt_extended import JWTManager, create_access_token # type: ignore
import bcrypt # type: ignore
from Application.scripts.utils import insert_user

secret = configparser.ConfigParser()
secret.read('Application/scripts/config.ini') 

app.config['JWT_SECRET_KEY'] = secret['db']['SECRET_KEY']
jwt = JWTManager(app)

# In your auth.py decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Debug: log all headers
        app.logger.debug(f"Received headers: {request.headers}")
        
        # Check for Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            app.logger.debug(f"Auth header: {auth_header}")
            
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
                app.logger.debug(f"Extracted token: {token}")
        
        if not token:
            app.logger.warning("Token is missing!")
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.objects(id=data['sub']).first()
        except Exception as e:
            app.logger.error(f"Token validation failed: {str(e)}")
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.objects(username=username).first()
    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        # Create identity with both username and admin status
        identity = {
            "username": username,
            "isAdmin": user.isAdmin  # Make sure this matches your User model field name
        }
        
        access_token = create_access_token(identity=identity, additional_claims={"isAdmin": user.isAdmin})
        return make_response(jsonify({
            'access_token': access_token,
            "message": "Login Successfull",
            "loggedinUser": username,
            "isAdmin": user.isAdmin
        }), 200)
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    is_admin = data.get('isAdmin', False)  # Nou câmp, default False
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user = {
        "username": username, 
        "password": hashed_password,
        "isAdmin": is_admin  # Include isAdmin
    }
    action = insert_user(user)
    if 'error' not in action:
        return {"message": "User succesfully added"}
    return action