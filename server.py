from flask import Flask, request, jsonify, make_response
import requests
from datetime import datetime
import os

app = Flask(__name__)

# Конфигурация для продакшена
TELEGRAM_TOKEN = os.environ.get('TELEGRAM_TOKEN', '8556081423:AAGai6_VIN_hq5dENN2MJOdFZ8nbMkI6U-U')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '745395678')
TELEGRAM_URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"


# ==============================================
# CORS НАСТРОЙКИ
# ==============================================
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response


@app.route('/api/send', methods=['OPTIONS'])
def handle_options():
    response = make_response()
    origin = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    return response


# ==============================================
# API ЭНДПОИНТЫ
# ==============================================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'Study Helper API',
        'timestamp': datetime.now().isoformat(),
        'telegram_configured': bool(TELEGRAM_TOKEN and TELEGRAM_TOKEN != 'ВАШ_ТОКЕН_БОТА')
    })


@app.route('/api/send', methods=['POST'])
def send_to_tg():
    try:
        data = request.json

        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        name = data.get('name', '').strip()
        contact = data.get('contact', '').strip()

        if not name or not contact:
            return jsonify({
                'success': False,
                'error': 'Заполните обязательные поля: имя и контакты'
            }), 400

        # Формируем сообщение для Telegram
        message = f"""
📧 <b>НОВАЯ ЗАЯВКА С САЙТА</b>

👤 <b>Имя:</b> {html_escape(name)}
📞 <b>Контакты:</b> {html_escape(contact)}
💼 <b>Услуга:</b> {html_escape(data.get('service', 'Не указана'))}
📝 <b>Задача:</b> {html_escape(data.get('message', 'Не указана'))}
⏰ <b>Время:</b> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}

🌐 <b>Источник:</b> Study Helper Website
        """

        # Отправляем в Telegram
        response = requests.post(
            TELEGRAM_URL,
            json={
                'chat_id': TELEGRAM_CHAT_ID,
                'text': message,
                'parse_mode': 'HTML',
                'disable_web_page_preview': True
            },
            timeout=10
        )

        if response.status_code == 200:
            print(f"✅ Заявка отправлена от: {name}")
            return jsonify({
                'success': True,
                'message': 'Заявка отправлена!'
            })
        else:
            print(f"❌ Ошибка Telegram API: {response.status_code}")
            return jsonify({
                'success': False,
                'error': 'Ошибка при отправке в Telegram'
            }), 500

    except Exception as e:
        print(f"❌ Ошибка сервера: {e}")
        return jsonify({
            'success': False,
            'error': 'Внутренняя ошибка сервера'
        }), 500


def html_escape(text):
    if not text:
        return ''
    return (str(text)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;'))


# ==============================================
# СТАТИЧЕСКИЕ ФАЙЛЫ (опционально)
# ==============================================
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    if path and os.path.exists(os.path.join('static', path)):
        return send_from_directory('static', path)
    return 'Study Helper API is running'


if __name__ == '__main__':
    print(f"🚀 Study Helper API запущен")
    print(f"📱 Telegram бот: {'Настроен' if TELEGRAM_TOKEN and TELEGRAM_TOKEN != 'ВАШ_ТОКЕН_БОТА' else 'Не настроен!'}")
    app.run(host='0.0.0.0', port=5000, debug=False)