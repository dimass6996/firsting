#!/bin/bash
cd /home/study-helper
source venv/bin/activate
exec gunicorn -c gunicorn_config.py simple_server:app
