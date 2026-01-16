
# This is a temporary script to test if we can run the Flask app.
import sys
import subprocess

def install_and_run():
    try:
        import flask
        print("Flask is installed.")
    except ImportError:
        print("Flask not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "flask", "flask-cors"])

    try:
        from aqi_service import app, initialize_model
        print("Starting AQI Service...")
        initialize_model()
        app.run(host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"Error running app: {e}")

if __name__ == "__main__":
    install_and_run()
