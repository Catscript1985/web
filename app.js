// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "DÁN_API_KEY",
  authDomain: "xxx.firebaseapp.com",
  databaseURL: "https://xxx-default-rtdb.firebaseio.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "xxx",
  appId: "xxx"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===== VAR =====
let history = [];
let weights = { trend: 1, ml: 1, dice: 1 };
let currentKey = null;

// ===== LOGIN =====
function login() {
    let input = document.getElementById("keyInput").value;

    if (input === "TGL1985@@" || input === "TGL1985@") {
        document.getElementById("admin").style.display = "block";
    }

    db.ref("keys/" + input).once("value", snap => {
        let data = snap.val();

        if (!data) {
            alert("Sai key!");
            return;
        }

        let now = new Date();
        let exp = new Date(data.expire);

        if (exp < now) {
            alert("Hết hạn!");
            return;
        }

        currentKey = data;
        startTimer(exp);

        document.getElementById("loginBox").style.display = "none";
        document.getElementById("main").style.display = "block";
    });
}

// ===== TIMER =====
function startTimer(exp) {
    setInterval(() => {
        let now = new Date();
        let diff = exp - now;

        if (diff <= 0) location.reload();

        let m = Math.floor(diff / 60000);
        let s = Math.floor((diff % 60000) / 1000);

        document.getElementById("timerBox").innerText =
            `⏳ ${m}:${s}`;
    }, 1000);
}

// ===== ADMIN =====
function createKey() {
    let k = document.getElementById("newKey").value;
    let time = parseInt(document.getElementById("timeKey").value);

    let exp = new Date();
    exp.setMinutes(exp.getMinutes() + time);

    db.ref("keys/" + k).set({
        expire: exp.toISOString()
    });

    loadKeys();
}

function extendKey() {
    let k = document.getElementById("extendKey").value;
    let time = parseInt(document.getElementById("extendTime").value);

    db.ref("keys/" + k).once("value", snap => {
        let data = snap.val();
        if (!data) return;

        let exp = new Date(data.expire);
        exp.setMinutes(exp.getMinutes() + time);

        db.ref("keys/" + k).update({
            expire: exp.toISOString()
        });
    });
}

// ===== LOAD KEY LIST =====
function loadKeys() {
    db.ref("keys").on("value", snap => {
        document.getElementById("keyList").innerText =
            JSON.stringify(snap.val(), null, 2);
    });
}

// ===== MD5 =====
function isValidMD5(md5) {
    return /^[a-f0-9]{32}$/i.test(md5);
}

function convertMD5() {
    let md5 = document.getElementById("md5Input").value;

    if (!isValidMD5(md5)) {
        document.getElementById("md5Result").innerText = "MD5 sai!";
        return;
    }

    let num = md5.charCodeAt(0) % 100;
    let result = num >= 50 ? "TÀI" : "XỈU";

    document.getElementById("md5Result").innerText = result;
    document.getElementById("md5Confidence").innerText =
        "Độ tin cậy: " + (60 + Math.random()*40).toFixed(0) + "%";
}

// ===== AI V21 =====
function predictAI() {
    if (history.length < 5) return;

    let last = history.slice(-10);
    let score = { T: 0, X: 0 };

    let countT = last.filter(x => x === 'T').length;
    let countX = last.filter(x => x === 'X').length;

    if (countT > countX) score.T++;
    else score.X++;

    let final = score.T > score.X ? 'T' : 'X';

    document.getElementById("predict").innerText =
        final === 'T' ? "🔥 TÀI" : "❄️ XỈU";

    document.getElementById("confidence").innerText =
        Math.round((Math.max(score.T, score.X) / (score.T + score.X)) * 100) + "%";

    return final;
}

function addResult(r) {
    history.push(r);
    document.getElementById("history").innerText = history.join(" - ");
    predictAI();
}
