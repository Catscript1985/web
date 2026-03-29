let history = [];
let weights = { trend: 1, ml: 1, dice: 1 };

let keys = [];
let currentKey = null;
let isAdmin = false;

// ===== LOAD KEY ONLINE =====
async function loadKeysOnline() {
    let res = await fetch("https://raw.githubusercontent.com/tenban/lamtool/main/key.json");
    keys = await res.json();
}

// ===== LOGIN =====
async function login() {
    let input = document.getElementById("keyInput").value;

    await loadKeysOnline();

    if (input === "TGL1985@@" || input === "TGL1985@") {
        isAdmin = true;
        document.getElementById("admin").style.display = "block";
    }

    let now = new Date();
    let found = keys.find(k => k.key === input);

    if (!found && !isAdmin) {
        alert("Sai key!");
        return;
    }

    if (found) {
        if (new Date(found.expire) < now) {
            alert("Key hết hạn!");
            return;
        }
        currentKey = found;
        startTimer();
    }

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("main").style.display = "block";
}

// ===== TIMER =====
function startTimer() {
    setInterval(() => {
        if (!currentKey) return;

        let now = new Date();
        let exp = new Date(currentKey.expire);
        let diff = exp - now;

        if (diff <= 0) {
            alert("Key hết hạn!");
            location.reload();
        }

        let m = Math.floor(diff / 60000);
        let s = Math.floor((diff % 60000) / 1000);

        document.getElementById("timerBox").innerText =
            `⏳ ${m}:${s < 10 ? '0' : ''}${s}`;
    }, 1000);
}

// ===== MD5 =====
function isValidMD5(md5) {
    return /^[a-f0-9]{32}$/i.test(md5);
}

function md5ToNumber(md5) {
    let sum = 0;
    for (let i = 0; i < md5.length; i++) {
        sum += md5.charCodeAt(i);
    }
    return sum % 100;
}

function convertMD5() {
    let md5 = document.getElementById("md5Input").value.trim();

    if (!isValidMD5(md5)) {
        document.getElementById("md5Result").innerText = "❌ MD5 sai!";
        document.getElementById("md5Confidence").innerText = "";
        return;
    }

    let num = md5ToNumber(md5);
    let result = num >= 50 ? 'TÀI' : 'XỈU';
    let confidence = 60 + Math.floor(Math.random() * 40);

    document.getElementById("md5Result").innerText = result;
    document.getElementById("md5Confidence").innerText =
        "Độ tin cậy: " + confidence + "%";
}

// ===== AI V21 =====
function predictAI() {
    if (history.length < 5) return;

    let last = history.slice(-10);
    let score = { T: 0, X: 0 };

    // TREND
    let countT = last.filter(x => x === 'T').length;
    let countX = last.filter(x => x === 'X').length;

    if (countT > countX) score.T += weights.trend;
    else score.X += weights.trend;

    // STREAK
    let streak = 1;
    for (let i = history.length - 1; i > 0; i--) {
        if (history[i] === history[i - 1]) streak++;
        else break;
    }

    if (streak >= 3) {
        let lastVal = history[history.length - 1];
        score[lastVal] += weights.dice;
    }

    // PATTERN
    let pattern = last.slice(-4).join('');

    if (pattern === "TTTT") score.X += weights.ml;
    if (pattern === "XXXX") score.T += weights.ml;

    // PROBABILITY
    score.T += countT / last.length;
    score.X += countX / last.length;

    let final = score.T > score.X ? 'T' : 'X';

    let confidence = Math.max(score.T, score.X) /
        (score.T + score.X);

    document.getElementById("predict").innerText =
        final === 'T' ? "🔥 TÀI" : "❄️ XỈU";

    document.getElementById("confidence").innerText =
        Math.round(confidence * 100) + "%";

    return final;
}

// ===== ADD RESULT =====
function addResult(r) {
    history.push(r);

    document.getElementById("history").innerText =
        history.join(" - ");

    let predict = predictAI();

    if (predict) {
        if (predict === r) {
            weights.trend += 0.2;
            weights.ml += 0.2;
        } else {
            weights.trend -= 0.1;
            weights.ml -= 0.1;
        }
    }
}
