// Инициализация Telegram
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Настройки
const PRIZES = [
    '🎁 Приз 1', '🎁 Приз 2', '🎁 Приз 3', '🎁 Приз 4',
    '🎁 Приз 5', '🎁 Приз 6', '🎁 Приз 7', '🎁 Приз 8'
];
const SEGMENT_ANGLE = 360 / PRIZES.length;
const STORAGE_KEY = 'last_spin_date';

const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const statusEl = document.getElementById('status');

let isSpinning = false;

// Рисуем сектора
function drawWheel() {
    wheel.innerHTML = '';
    PRIZES.forEach((prize, i) => {
        const segment = document.createElement('div');
        segment.style.cssText = `
            position: absolute;
            width: 50%;
            height: 50%;
            top: 0;
            left: 50%;
            transform-origin: 0% 100%;
            transform: rotate(${i * SEGMENT_ANGLE}deg);
            background: ${i % 2 === 0 ? 'var(--button)' : 'var(--bg)'};
            border: 1px solid rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: ${i % 2 === 0 ? 'var(--button-text)' : 'var(--text)'};
            padding-left: 20%;
            box-sizing: border-box;
            pointer-events: none;
        `;
        segment.textContent = prize;
        wheel.appendChild(segment);
    });
}

// Проверка: можно ли крутить сегодня
async function checkCanSpin() {
    try {
        const lastSpin = await tg.CloudStorage.getItem(STORAGE_KEY);
        const today = new Date().toDateString();
        if (lastSpin === today) {
            spinBtn.disabled = true;
            statusEl.textContent = 'Вы уже крутили сегодня. Приходите завтра!';
            return false;
        }
    } catch (e) {
        console.error('CloudStorage error:', e);
    }
    return true;
}

// Вращение
function spin() {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;
    statusEl.textContent = 'Крутим...';

    const randomIndex = Math.floor(Math.random() * PRIZES.length);
    const spins = 5; // полных оборотов
    const targetAngle = spins * 360 + (360 - randomIndex * SEGMENT_ANGLE) - SEGMENT_ANGLE / 2;

    wheel.style.transform = `rotate(${targetAngle}deg)`;

    setTimeout(async () => {
        const prize = PRIZES[randomIndex];
        statusEl.textContent = `Ваш приз: ${prize}`;
        isSpinning = false;

        // Сохраняем дату
        const today = new Date().toDateString();
        try {
            await tg.CloudStorage.setItem(STORAGE_KEY, today);
        } catch (e) {
            console.error('Save error:', e);
        }

        // Отправляем результат боту (опционально)
        tg.sendData(JSON.stringify({ prize, date: today }));
    }, 4100); // чуть больше времени анимации
}

spinBtn.addEventListener('click', spin);

// Запуск
drawWheel();
checkCanSpin();
