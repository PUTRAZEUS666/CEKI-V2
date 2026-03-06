const scoreBody = document.getElementById('scoreBody');
const winScoreSelect = document.getElementById('winScore');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');

let scores = [0, 0, 0, 0];
let players = ["Player 1", "Player 2", "Player 3", "Player 4"];
let confettiParticles = [];
let roundNumber = 1;
let gameHistory = [];
let playerAvatars = {}; // Store player avatars

// Load saved avatars on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.querySelector('.theme-icon');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
    }
    
    // Load saved avatars
    for (let i = 1; i <= 4; i++) {
        const savedAvatar = localStorage.getItem(`avatar${i}`);
        if (savedAvatar) {
            document.getElementById(`avatar${i}`).src = savedAvatar;
            playerAvatars[i] = savedAvatar;
        }
    }
});

// Player Avatar Upload Function
function uploadAvatar(playerNum) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const avatarImg = document.getElementById(`avatar${playerNum}`);
                avatarImg.src = event.target.result;
                playerAvatars[playerNum] = event.target.result;
                localStorage.setItem(`avatar${playerNum}`, event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Export/Save Functions
function saveGame() {
    const gameData = {
        scores: scores,
        players: players,
        roundNumber: roundNumber,
        history: gameHistory,
        winScore: winScoreSelect.value,
        avatars: playerAvatars,
        date: new Date().toLocaleString()
    };
    
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ceki_game_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Game saved successfully!');
}

function printScores() {
    window.print();
}

// Theme Toggle Function
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.querySelector('.theme-icon');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
    }
});

// Setup canvas size
function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Sound Effects Functions
function playOvertakeSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 300;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function playWinSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 587.33, 659.25, 783.99]; // C, D, E, G
    
    notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * 0.15);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
    });
}

// Confetti Class
class ConfettiParticle {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = -10;
        this.size = Math.random() * 8 + 5;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        
        if (this.y > confettiCanvas.height) {
            return false;
        }
        return true;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function createConfetti() {
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            confettiParticles.push(new ConfettiParticle());
        }, i * 10);
    }
    animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    confettiParticles = confettiParticles.filter(particle => {
        particle.draw();
        return particle.update();
    });
    
    if (confettiParticles.length > 0) {
        requestAnimationFrame(animateConfetti);
    }
}

function syncTableNames() {
    for (let i = 1; i <= 4; i++) {
        const nameElement = document.getElementById(`name${i}`);
        players[i - 1] = nameElement.innerText; // Update nama pemain di array
    }
}

// Tambahkan event listener untuk perubahan nama
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 1; i <= 4; i++) {
        const nameElement = document.getElementById(`name${i}`);
        if (nameElement) {
            nameElement.addEventListener('input', syncTableNames);
        }
    }
});

function addScore() {
    let inputScores = [
        parseInt(document.getElementById("scoreInput1").value) || 0,
        parseInt(document.getElementById("scoreInput2").value) || 0,
        parseInt(document.getElementById("scoreInput3").value) || 0,
        parseInt(document.getElementById("scoreInput4").value) || 0
    ];

    // Simpan skor sebelumnya untuk deteksi overtaken
    let previousScores = [...scores];

    // Tambahkan input scores ke skor total
    for (let i = 0; i < scores.length; i++) {
        scores[i] += inputScores[i];
    }

    // Cek logika overtaken: jika pemain memiliki skor > 100 dan dikejar oleh pemain lain
    checkOvertaken(previousScores);

    // Increment round counter
    roundNumber++;
    document.getElementById('roundNumber').innerText = roundNumber;

    // Find highest score in this round for highlighting
    let maxRoundScore = Math.max(...inputScores);
    let minRoundScore = Math.min(...inputScores.filter(s => s > 0));

    let newRow = document.createElement("tr");
    inputScores.forEach((score, index) => {
        let cell = document.createElement("td");
        cell.innerText = score;
        
        // Highlight highest score in round with green and trophy
        if (score === maxRoundScore && score > 0) {
            cell.classList.add('round-winner');
            cell.innerHTML = score + ' 🏆';
        }
        // Highlight lowest score in round with pink
        else if (score === minRoundScore && score > 0 && minRoundScore !== maxRoundScore) {
            cell.classList.add('round-loser');
        }
        
        newRow.appendChild(cell);
    });
    scoreBody.appendChild(newRow);

    // Save to history
    gameHistory.push({
        round: roundNumber,
        scores: [...inputScores],
        totals: [...scores]
    });

    for (let i = 0; i < scores.length; i++) {
        document.getElementById(`total${i + 1}`).innerText = scores[i];
    }

    document.getElementById("scoreInput1").value = "";
    document.getElementById("scoreInput2").value = "";
    document.getElementById("scoreInput3").value = "";
    document.getElementById("scoreInput4").value = "";

    updateScoreInfo(); // Perbarui nama skor tertinggi dan terendah
    checkWin();
}

function checkWin() {
    const winScore = parseInt(winScoreSelect.value);
    for (let i = 0; i < scores.length; i++) {
        if (scores[i] >= winScore) {
            playWinSound();
            createConfetti();
            setTimeout(() => {
                alert(`🎉 ${players[i]} MENANG! 🎉`);
                resetGame();
            }, 500);
            break;
        }
    }
}

function resetGame() {
    scores = [0, 0, 0, 0];
    roundNumber = 1;
    gameHistory = [];
    scoreBody.innerHTML = "";
    document.getElementById('roundNumber').innerText = "1";
    for (let i = 0; i < 4; i++) {
        document.getElementById(`total${i + 1}`).innerText = "TOTAL";
    }
}

function updateScoreInfo() {
    let maxScore = Math.max(...scores);
    let minScore = Math.min(...scores);
    let maxIndex = scores.indexOf(maxScore);
    let minIndex = scores.indexOf(minScore);

    document.getElementById("highestScoreName").innerText = players[maxIndex];
    document.getElementById("lowestScoreName").innerText = players[minIndex];
}

function syncPlayerNames() {
    for (let i = 1; i <= 4; i++) {
        const nameElement = document.getElementById(`name${i}`); // Nama di tabel atas
        const headerElement = document.getElementById(`header${i}`); // Nama di tabel bawah

        // Perbarui nama di tabel bawah saat tabel atas diubah
        if (nameElement && headerElement) {
            headerElement.innerText = nameElement.innerText;
        }
    }
}

// Tambahkan event listener untuk perubahan nama
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 1; i <= 4; i++) {
        const nameElement = document.getElementById(`name${i}`);
        if (nameElement) {
            nameElement.addEventListener('input', syncPlayerNames);
        }
    }
});



function checkOvertaken(previousScores) {
    // Rule 1: Only players with previous score >= 105 can be overtaken
    for (let i = 0; i < scores.length; i++) {
        if (previousScores[i] < 105) continue;

        for (let j = 0; j < scores.length; j++) {
            if (i === j) continue;

            // Only allow overtaking if j was previously below i
            if (previousScores[j] < previousScores[i]) {
                // j overtakes i if j's score now > i's score
                if (scores[j] > scores[i]) {
                    if (scores[i] > 0) {
                        let gained = scores[i] - previousScores[i];
                        scores[i] = 0;
                        playOvertakeSound();
                        setTimeout(() => {
                            alert(`⚠️ ${players[i]} TERBALAP OLEH ${players[j]} (dapat ${gained} poin)`);
                        }, 200);
                    }
                    break;
                }
            }
            // If scores are equal, only allow overtaking if j was previously below i
            else if (previousScores[j] < previousScores[i] && scores[j] === scores[i]) {
                // No overtaking if scores are equal, but keep logic for clarity
                // (do nothing)
            }
        }
    }
}
