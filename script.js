// ==============================================
// КОНФИГУРАЦИЯ
// ==============================================

const API_URL = 'https://3501ba9ab04f65.lhr.life/api/send';
// ==============================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ
// ==============================================

function showNotification(message, type = 'info', duration = 5000) {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) oldNotification.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else if (type === 'info') {
        notification.style.backgroundColor = '#3b82f6';
    } else {
        notification.style.backgroundColor = '#6b7280';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function showTelegramFallback(data) {
    const text = `Здравствуйте! Меня зовут ${data.name}. ` +
                 `Нужна помощь с: ${data.service}. ` +
                 `Задача: ${data.message}`;
    const encodedText = encodeURIComponent(text);
    const telegramUrl = `https://t.me/@dimass6996?text=${encodedText}`;
    
    showNotification(`
        <div style="text-align: center;">
            <p>📱 <b>Нажмите кнопку ниже</b></p>
            <p>Вы откроете Telegram с готовым сообщением</p>
            <a href="${telegramUrl}" target="_blank" 
               style="display: inline-block; background: #0088cc; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 10px; font-weight: bold;">
                ✨ Открыть Telegram
            </a>
            <p style="margin-top: 10px; font-size: 14px; opacity: 0.8;">
                Или напишите мне напрямую: @dimass6996
            </p>
        </div>
    `, 'info', 10000);
}


// ==============================================
// ОТЛАДОЧНЫЕ ФУНКЦИИ
// ==============================================
	
function debugForm() {
    const nameInput = document.getElementById('name');
    const contactInput = document.getElementById('contact-data');
    const serviceSelect = document.getElementById('service');
    const messageInput = document.getElementById('message');
    
    if (!nameInput || !contactInput || !serviceSelect || !messageInput) {
        console.error('Не все элементы формы найдены!');
        return null;
    }
    
    const formData = {
        name: (nameInput.value || '').replace(/^\s+|\s+$/g, ''),
        contact: (contactInput.value || '').replace(/^\s+|\s+$/g, ''),
        service: serviceSelect.value || '',
        message: (messageInput.value || '').replace(/^\s+|\s+$/g, '')
    };
    
    console.log('Текущие данные формы:', formData);
    return formData;
}

// Сделать функцию доступной глобально
window.debugForm = debugForm;

// ==============================================
// СТИЛИ ДЛЯ АНИМАЦИЙ
// ==============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.01); }
        100% { transform: scale(1); }
    }
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification a {
        color: white;
        text-decoration: underline;
        font-weight: bold;
        display: block;
        margin-top: 8px;
    }
    .notification a:hover {
        text-decoration: none;
        opacity: 0.9;
    }
`;
document.head.appendChild(style);

// ==============================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Study Helper сайт загружен');
    console.log('API endpoint:', API_URL);
    
    // Устанавливаем текущий год в футере
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // FAQ аккордеон
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('active');
        });
    });
    
    // Фильтрация портфолио
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            const items = document.querySelectorAll('.portfolio-item');
            
            items.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // ==============================================
    // ОБРАБОТКА ФОРМЫ ЗАЯВКИ
    // ==============================================
    
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('=== НАЧАЛО ОТПРАВКИ ФОРМЫ ===');
            
            const submitBtn = this.querySelector('.submit-btn');
            if (!submitBtn) return;
            
            const originalText = submitBtn.textContent;
            
            // Показываем загрузку
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            
            // Получаем элементы формы
            const nameInput = document.getElementById('name');
            const contactInput = document.getElementById('contact-data');
            const serviceSelect = document.getElementById('service');
            const messageInput = document.getElementById('message');
            const agreeCheckbox = document.getElementById('agree');
            
            // Проверяем, что элементы существуют
            if (!nameInput || !contactInput || !serviceSelect || !messageInput) {
                console.error('Не найдены элементы формы');
                showNotification('❌ Ошибка формы. Обновите страницу.', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Получаем значения
// Получаем значения
			// Получаем значения - фикс без .trim()
			const formData = {
				name: (nameInput.value || '').replace(/^\s+|\s+$/g, ''),
				contact: (contactInput.value || '').replace(/^\s+|\s+$/g, ''),
				service: serviceSelect.value || '',
				message: (messageInput.value || '').replace(/^\s+|\s+$/g, '')
			};

			console.log('Собранные данные:', formData);	

			// Проверяем, что service не пустой (кроме случая 'other')
			if (!formData.service || formData.service === 'Выберите услугу') {
				showNotification('⚠️ Выберите тип услуги', 'error');
				submitBtn.textContent = originalText;
				submitBtn.disabled = false;
				serviceSelect.focus();
				return;
			}
            
            // Валидация
            if (!formData.name) {
                showNotification('⚠️ Введите ваше имя', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                nameInput.focus();
                return;
            }
            
            if (!formData.contact) {
                showNotification('⚠️ Введите контакты (Telegram или Email)', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                contactInput.focus();
                return;
            }
            
            if (!formData.service) {
                showNotification('⚠️ Выберите тип услуги', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                serviceSelect.focus();
                return;
            }
            
            if (agreeCheckbox && !agreeCheckbox.checked) {
                showNotification('⚠️ Необходимо согласие на обработку данных', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                agreeCheckbox.focus();
                return;
            }
            
            try {
                console.log('Отправляю на сервер:', API_URL);
                
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('Статус ответа:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('Ответ сервера:', result);
                
                if (result.success === true) {
                    showNotification('✅ Заявка отправлена! Свяжусь с вами в течение 30 минут.', 'success');
                    
                    // Очищаем форму
                    this.reset();
                    
                    // Анимация
                    document.body.style.animation = 'pulse 0.5s';
                    setTimeout(() => {
                        document.body.style.animation = '';
                    }, 500);
                    
                } else {
                    const errorMsg = result.error || 'Неизвестная ошибка сервера';
                    showNotification(`❌ ${errorMsg}`, 'error');
                    showTelegramFallback(formData);
                }
                
            } catch (error) {
                console.error('Ошибка при отправке:', error);
                
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    showNotification('🌐 Сервер недоступен. Используйте запасной вариант.', 'error');
                } else {
                    showNotification('❌ Ошибка сети. Попробуйте позже.', 'error');
                }
                
                showTelegramFallback(formData);
                
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // ==============================================
    // КНОПКИ "ЗАКАЗАТЬ ЭТУ УСЛУГУ"
    // ==============================================
    
    document.querySelectorAll('.service-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const serviceTitle = this.getAttribute('data-service');
            const nameField = document.getElementById('name');
            const serviceSelect = document.getElementById('service');
            
            if (!serviceSelect || !nameField) return;
            
            // Устанавливаем выбранную услугу
            for (let option of serviceSelect.options) {
                if (option.value === serviceTitle) {
                    serviceSelect.value = serviceTitle;
                    break;
                }
            }
            
            // Фокус на поле имени
            nameField.focus();
            
            // Прокрутка к форме
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                window.scrollTo({
                    top: contactSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ==============================================
    // ПЛАВНАЯ ПРОКРУТКА ДЛЯ ССЫЛОК В МЕНЮ
    // ==============================================
    
    document.querySelectorAll('nav a, .header-btn').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href;
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

// ==============================================
// ФУНКЦИИ ДЛЯ ПОВТОРНОЙ ОТПРАВКИ
// ==============================================

window.addEventListener('load', () => {
    const pending = JSON.parse(localStorage.getItem('pending_requests') || '[]');
    
    if (pending.length > 0) {
        showNotification(`
            У вас есть ${pending.length} неотправленных заявок. 
            <button onclick="retryPendingRequests()" 
                    style="margin-left: 10px; background: white; color: #3b82f6; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                Попробовать отправить
            </button>
        `, 'info', 8000);
    }
});

async function retryPendingRequests() {
    const pending = JSON.parse(localStorage.getItem('pending_requests') || '[]');
    
    if (pending.length === 0) {
        showNotification('Нет неотправленных заявок', 'info');
        return;
    }
    
    showNotification(`Пытаюсь отправить ${pending.length} заявок...`, 'info');
    
    for (const request of pending) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });
            
            if (response.ok) {
                console.log('Заявка отправлена:', request.name);
            }
        } catch (error) {
            console.error('Ошибка при повторной отправке:', error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    localStorage.removeItem('pending_requests');
    showNotification('Повторная отправка завершена', 'success');
}
