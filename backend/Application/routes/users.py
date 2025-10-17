from Application import app
import configparser
import pymongo # type: ignore
from flask import jsonify, request # type: ignore
from ..database.models import User
import bcrypt # type: ignore
from flask import jsonify, request
from bson import ObjectId 

# from backend.Application.routes.auth import token_required

secret = configparser.ConfigParser()
secret.read('Application/scripts/config.ini')
client = pymongo.MongoClient(secret['db']['MONGO_URL'])
mydb = client.energysaving

@app.route('/users', methods=['GET', 'POST'])  # Combină ambele metode
def handle_users():
    if request.method == 'GET':
        try:
            users = User.objects()
            users_list = []
            for user in users:
                users_list.append({
                    'id': str(user.id),
                    'username': user.username,
                    'isAdmin': getattr(user, 'isAdmin', False)
                })
            return jsonify(users_list), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            is_admin = data.get('isAdmin', False)
            
            # Verifică dacă username-ul există deja
            existing_user = User.objects(username=username).first()
            if existing_user:
                return jsonify({'error': 'Username already exists'}), 400
            
            # Creează user nou
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            new_user = User(
                username=username,
                password=hashed_password.decode('utf-8'),
                isAdmin=is_admin
            )
            new_user.save()
            
            return jsonify({'message': 'User created successfully'}), 201
        except Exception as e:
            print(f"Error creating user: {e}")
            return jsonify({'error': str(e)}), 400
        
@app.route('/users/<username>', methods=['DELETE'])
def delete_user(username):
    try:
        # Properly handle URL-encoded usernames
        username = request.view_args['username']
        
        # Find user to delete
        user_to_delete = User.objects(username=username).first()
        if not user_to_delete:
            return jsonify({'error': 'User not found'}), 404
            
        # Delete the user
        user_to_delete.delete()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting user: {e}")
        return jsonify({'error': str(e)}), 500