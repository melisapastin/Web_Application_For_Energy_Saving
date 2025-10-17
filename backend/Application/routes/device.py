from Application import app
from flask import jsonify, request
from ..database.models import Device
from flask_cors import CORS

CORS(app)

@app.route('/devices', methods=['GET'])
def get_devices():
    try:
        devices = Device.objects().to_json()
        return devices, 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/device', methods=['POST'])
def add_device():
    try:
        device_data = request.get_json()
        new_device = Device(**device_data)
        new_device.save()
        return jsonify({'message': 'Device added successfully'}), 201
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400

@app.route('/device/<device_id>', methods=['PUT'])
def update_device(device_id):
    try:
        device_data = request.get_json()
        device = Device.objects.get(id=device_id)
        
        # Update device fields
        device.deviceName = device_data.get('deviceName', device.deviceName)
        device.group = device_data.get('group', device.group)
        device.powerOnTime = device_data.get('powerOnTime', device.powerOnTime)
        device.powerOffTime = device_data.get('powerOffTime', device.powerOffTime)
        device.count = device_data.get('count', device.count)
        device.consumptionPerHour = device_data.get('consumptionPerHour', device.consumptionPerHour)
        
        device.save()
        return jsonify({'message': 'Device updated successfully'}), 200
    except Device.DoesNotExist:
        return jsonify({'error': 'Device not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# CORRECTED DELETE endpoint (removed extra quote)
@app.route('/device/<device_id>', methods=['DELETE'])
def delete_device(device_id):
    try:
        device = Device.objects.get(id=device_id)
        device.delete()
        return jsonify({'message': 'Device deleted successfully'}), 200
    except Device.DoesNotExist:
        return jsonify({'error': 'Device not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500