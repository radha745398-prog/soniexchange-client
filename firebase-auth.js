import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Project Credentials
const firebaseConfig = {
    apiKey: "AIzaSyC_qTjOTUx0BdW5qMajZauMvquItJXchVA",
    authDomain: "soniexchange-eedf6.firebaseapp.com",
    projectId: "soniexchange-eedf6",
    storageBucket: "soniexchange-eedf6.firebasestorage.app",
    messagingSenderId: "885491339460",
    appId: "1:885491339460:web:611843ab509f023a397991"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global Login Function linked with HTML form
window.handleLogin = async function() {
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const loginBtn = document.getElementById('loginBtn');

    if (!usernameInput || !passwordInput) {
        alert("Kripya Username aur Password bharein!");
        return;
    }

    try {
        loginBtn.innerText = "Verifying...";
        loginBtn.disabled = true;

        // Check User Document in Firestore
        const userRef = doc(db, "users", usernameInput);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();

            // Check Password
            if (userData.password === passwordInput) {
                
                // Check Active Status
                if (userData.userActive === false) {
                    alert("Aapka account suspended ya inactive hai. Support se contact karein!");
                    resetBtn();
                    return;
                }

                // Verify Role Access for Client Portal
                if (userData.role === 'ADMIN' || userData.role === 'SUPER' || userData.role === 'MASTER') {
                    alert("Yeh Client Portal hai. Admin panel access karne ke liye apne dedicated Admin Domain ka upayog karein!");
                    resetBtn();
                    return;
                }

                // Success Login
                alert("Login Successful! Welcome to SoniExchange Client Dashboard.");
                // window.location.href = "dashboard.html";

            } else {
                alert("Galat Password!");
                resetBtn();
            }
        } else {
            alert("User ID nahi mili! Kripya sahi Username darj karein.");
            resetBtn();
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Error: Server se connect karne me problem aayi.");
        resetBtn();
    }
};

function resetBtn() {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.innerHTML = 'Login <i class="fa-solid fa-right-to-bracket"></i>';
    loginBtn.disabled = false;
}

window.demoLogin = function() {
    document.getElementById('username').value = "demo_client";
    document.getElementById('password').value = "demo123";
    window.handleLogin();
};
