document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Reset both when switching tabs
            resetStopwatch();
            resetTimer();
        });
    });

    // Stopwatch functionality
    const stopwatchDisplay = document.getElementById('stopwatchDisplay');
    const startStopwatchBtn = document.getElementById('startStopwatch');
    const lapStopwatchBtn = document.getElementById('lapStopwatch');
    const resetStopwatchBtn = document.getElementById('resetStopwatch');
    const lapsList = document.getElementById('lapsList');

    let stopwatchInterval;
    let stopwatchRunning = false;
    let stopwatchStartTime;
    let stopwatchElapsed = 0;
    let lapTimes = [];

    startStopwatchBtn.addEventListener('click', toggleStopwatch);
    lapStopwatchBtn.addEventListener('click', recordLap);
    resetStopwatchBtn.addEventListener('click', resetStopwatch);

    function toggleStopwatch() {
        if (stopwatchRunning) {
            pauseStopwatch();
        } else {
            startStopwatch();
        }
    }

    function startStopwatch() {
        stopwatchRunning = true;
        stopwatchStartTime = Date.now() - stopwatchElapsed;
        stopwatchInterval = setInterval(updateStopwatch, 10);
        
        startStopwatchBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        startStopwatchBtn.style.background = '#e74c3c';
        lapStopwatchBtn.disabled = false;
    }

    function pauseStopwatch() {
        stopwatchRunning = false;
        clearInterval(stopwatchInterval);
        
        startStopwatchBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        startStopwatchBtn.style.background = '';
    }

    function resetStopwatch() {
        stopwatchRunning = false;
        clearInterval(stopwatchInterval);
        stopwatchElapsed = 0;
        lapTimes = [];
        
        stopwatchDisplay.textContent = '00:00:00.00';
        startStopwatchBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        startStopwatchBtn.style.background = '';
        lapStopwatchBtn.disabled = true;
        lapsList.innerHTML = '';
    }

    function updateStopwatch() {
        stopwatchElapsed = Date.now() - stopwatchStartTime;
        stopwatchDisplay.textContent = formatStopwatchTime(stopwatchElapsed);
    }

    function formatStopwatchTime(milliseconds) {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        const centiseconds = Math.floor((milliseconds % 1000) / 10);
        
        return `${padTime(hours)}:${padTime(minutes)}:${padTime(seconds)}.${padTime(centiseconds)}`;
    }

    function recordLap() {
        if (!stopwatchRunning) return;
        
        const lapTime = stopwatchElapsed;
        const previousLapTime = lapTimes.length > 0 ? lapTimes[lapTimes.length - 1].totalTime : 0;
        const lapDuration = lapTime - previousLapTime;
        
        lapTimes.push({
            lapNumber: lapTimes.length + 1,
            lapTime: lapDuration,
            totalTime: lapTime
        });
        
        updateLapsList();
    }

    function updateLapsList() {
        lapsList.innerHTML = '';
        
        lapTimes.forEach((lap, index) => {
            const lapElement = document.createElement('div');
            lapElement.className = 'lap-item';
            lapElement.innerHTML = `
                <span class="lap-number">Lap ${lap.lapNumber}</span>
                <span class="lap-time">${formatStopwatchTime(lap.lapTime)}</span>
                <span class="lap-total">${formatStopwatchTime(lap.totalTime)}</span>
            `;
            
            if (index === lapTimes.length - 1) {
                lapElement.classList.add('latest-lap');
            }
            
            lapsList.appendChild(lapElement);
        });
        
        // Scroll to latest lap
        lapsList.scrollTop = lapsList.scrollHeight;
    }

    // Timer functionality
    const timerHours = document.getElementById('timerHours');
    const timerMinutes = document.getElementById('timerMinutes');
    const timerSeconds = document.getElementById('timerSeconds');
    const timerDisplay = document.getElementById('timerDisplay');
    const startTimerBtn = document.getElementById('startTimer');
    const pauseTimerBtn = document.getElementById('pauseTimer');
    const resetTimerBtn = document.getElementById('resetTimer');
    const autoRepeat = document.getElementById('autoRepeat');
    const soundAlert = document.getElementById('soundAlert');
    const timerAlert = document.getElementById('timerAlert');

    let timerInterval;
    let timerRunning = false;
    let timerTotalTime = 0;
    let timerRemaining = 0;

    // Initialize timer display
    updateTimerDisplay();

    timerHours.addEventListener('input', updateTimerDisplay);
    timerMinutes.addEventListener('input', updateTimerDisplay);
    timerSeconds.addEventListener('input', updateTimerDisplay);

    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    function updateTimerDisplay() {
        const hours = parseInt(timerHours.value) || 0;
        const minutes = parseInt(timerMinutes.value) || 0;
        const seconds = parseInt(timerSeconds.value) || 0;
        
        timerTotalTime = (hours * 3600) + (minutes * 60) + seconds;
        timerRemaining = timerTotalTime;
        
        timerDisplay.textContent = formatTimerTime(timerRemaining);
    }

    function formatTimerTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${padTime(hours)}:${padTime(minutes)}:${padTime(secs)}`;
        } else {
            return `${padTime(minutes)}:${padTime(secs)}`;
        }
    }

    function startTimer() {
        if (timerTotalTime <= 0) {
            UIUtils.showNotification('Please set a valid timer duration', 'warning');
            return;
        }

        timerRunning = true;
        timerRemaining = timerTotalTime;
        
        timerInterval = setInterval(updateTimer, 1000);
        
        startTimerBtn.style.display = 'none';
        pauseTimerBtn.style.display = 'inline-flex';
        
        // Disable time inputs while running
        timerHours.disabled = true;
        timerMinutes.disabled = true;
        timerSeconds.disabled = true;
    }

    function pauseTimer() {
        timerRunning = false;
        clearInterval(timerInterval);
        
        startTimerBtn.style.display = 'inline-flex';
        pauseTimerBtn.style.display = 'none';
        startTimerBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    }

    function resetTimer() {
        timerRunning = false;
        clearInterval(timerInterval);
        
        startTimerBtn.style.display = 'inline-flex';
        pauseTimerBtn.style.display = 'none';
        startTimerBtn.innerHTML = '<i class="fas fa-play"></i> Start Timer';
        
        // Re-enable time inputs
        timerHours.disabled = false;
        timerMinutes.disabled = false;
        timerSeconds.disabled = false;
        
        updateTimerDisplay();
    }

    function updateTimer() {
        timerRemaining--;
        
        if (timerRemaining <= 0) {
            timerFinished();
            return;
        }
        
        timerDisplay.textContent = formatTimerTime(timerRemaining);
        
        // Visual feedback when time is running out
        if (timerRemaining <= 10) {
            timerDisplay.style.color = '#e74c3c';
            timerDisplay.style.fontWeight = 'bold';
        }
    }

    function timerFinished() {
        clearInterval(timerInterval);
        timerDisplay.textContent = '00:00';
        timerDisplay.style.color = '#e74c3c';
        timerDisplay.style.fontWeight = 'bold';
        
        // Play sound if enabled
        if (soundAlert.checked) {
            timerAlert.play().catch(e => console.log('Audio play failed:', e));
        }
        
        // Show notification
        UIUtils.showNotification('Timer finished!', 'success', 5000);
        
        // Auto-repeat if enabled
        if (autoRepeat.checked) {
            setTimeout(() => {
                resetTimer();
                startTimer();
            }, 2000);
        } else {
            resetTimer();
        }
    }

    function padTime(number) {
        return number.toString().padStart(2, '0');
    }
});

// Add CSS for stopwatch and timer
const stopwatchStyles = `
.tab-navigation {
    display: flex;
    margin-bottom: 2rem;
    border-bottom: 2px solid #e1e5e9;
}

.tab-btn {
    background: none;
    border: none;
    padding: 1rem 2rem;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
    font-size: 1rem;
    font-weight: 500;
}

.tab-btn.active {
    border-bottom-color: #4361ee;
    color: #4361ee;
}

.tab-btn:hover:not(.active) {
    background: #f8f9fa;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.timer-display {
    font-size: 4rem;
    text-align: center;
    font-family: 'Courier New', monospace;
    margin: 2rem 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 3px solid #e1e5e9;
    transition: all 0.3s ease;
}

.timer-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 2rem 0;
}

.time-inputs {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 2rem 0;
}

.time-input-group {
    text-align: center;
}

.time-input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.time-input-group input {
    width: 80px;
    padding: 0.75rem;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1.2rem;
    text-align: center;
    font-family: 'Courier New', monospace;
}

.laps-container {
    max-height: 300px;
    overflow-y: auto;
    margin-top: 2rem;
}

.laps-list {
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    padding: 1rem;
}

.lap-item {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    padding: 0.75rem;
    border-bottom: 1px solid #e1e5e9;
    font-family: 'Courier New', monospace;
}

.lap-item:last-child {
    border-bottom: none;
}

.lap-item.latest-lap {
    background: #e8f4fd;
    border-radius: 4px;
}

.lap-number {
    font-weight: 600;
}

.lap-time {
    text-align: center;
    color: #4361ee;
}

.lap-total {
    text-align: right;
    color: #666;
}

.timer-options {
    margin-top: 2rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.timer-options label {
    margin-bottom: 0.5rem;
    display: block;
}

@media (max-width: 768px) {
    .timer-display {
        font-size: 2.5rem;
    }
    
    .time-inputs {
        flex-direction: column;
        align-items: center;
    }
    
    .lap-item {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 0.5rem;
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = stopwatchStyles;
document.head.appendChild(styleSheet);