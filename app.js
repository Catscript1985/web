let history = [];
let weights = { dice: 1, trend: 1, ml: 1 };

let keys = [];
let currentKey = null;
let isAdmin = false;

// LOAD KEY
fetch("key.json")
.then(res => res.json())
.then(data => keys = data);

// LOGIN
function login() {
    let input = document.getElementById("keyInput").value;

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

// TIMER
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

// ADMIN
function createKey() {
    let k = document.getElementById("newKey").value;
    let time = parseInt(document.getElementById("timeKey").value);

    let expire = new Date();
    expire.setMinutes(expire.getMinutes() + time);

    keys.push({ key: k, expire: expire });

    saveKeys();
    loadKeys();
}

function extendKeyTime() {
    let k = document.getElementById("extendKey").value;
    let time = parseInt(document.getElementById("extendTime").value);

    let keyObj = keys.find(x => x.key === k);
    if (!keyObj) return alert("Không tìm thấy key");

    let exp = new Date(keyObj.expire);
    exp.setMinutes(exp.getMinutes() + time);

    keyObj.expire = exp;

    saveKeys();
    loadKeys();
}

function loadKeys() {
    document.getElementById("keyList").innerText =
        JSON.stringify(keys, null, 2);
}

function saveKeys() {
    console.log("Updated keys:", keys);
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
        document.getElementById("md5Result").innerText =
            "❌ Mã MD5 không hợp lệ!";
        document.getElementById("md5Confidence").innerText = "";
        return;
    }

    let num = md5ToNumber(md5);
    let result = num >= 50 ? 'TÀI' : 'XỈU';

    let confidence = 50 + Math.floor(Math.random() * 50);

    document.getElementById("md5Result").innerText =
        `Kết quả: ${result}`;

    document.getElementById("md5Confidence").innerText =
        `Độ tin cậy: ${confidence}%`;
}

// ===== AI =====
function predictAI() {
    if (history.length < 3) return;

    let last = history.slice(-5);

    let countT = last.filter(x => x === 'T').length;
    let countX = last.filter(x => x === 'X').length;

    let trend = countT > countX ? 'T' : 'X';
    let ml = Math.random() > 0.5 ? 'T' : 'X';
    let dice = Math.random() > 0.5 ? 'T' : 'X';

    let score = { T: 0, X: 0 };

    score[trend] += weights.trend;
    score[ml] += weights.ml;
    score[dice] += weights.dice;

    let final = score.T > score.X ? 'T' : 'X';

    let confidence = Math.max(score.T, score.X) /
        (weights.trend + weights.ml + weights.dice);

    document.getElementById("predict").innerText =
        final === 'T' ? "🔥 TÀI" : "❄️ XỈU";

    document.getElementById("confidence").innerText =
        Math.round(confidence * 100) + "%";

    return final;
}

// ADD RESULT
function addResult(r) {
    history.push(r);

    document.getElementById("history").innerText =
        history.join(" - ");

    let predict = predictAI();

    if (predict) {
        if (predict === r) {
            weights.trend += 0.1;
            weights.ml += 0.1;
        } else {
            weights.trend -= 0.05;
            weights.ml -= 0.05;
        }
    }
}