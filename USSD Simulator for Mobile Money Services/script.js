// Global variables
let currentService = null;
let currentMenu = 'main';
let inputBuffer = '';
let transactionData = {};
let transactionHistory = [];
let mpesaPin = '1234';
let airtelPin = '5678';
let telekomPin = '9012';
let mpesaBalance = 15000;
let airtelBalance = 8000;
let telekomBalance = 5000;

// Initialize with saved data or sample data
function initializeData() {
    const savedData = localStorage.getItem('ussdSimulatorData');
    
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            transactionHistory = parsedData.transactionHistory || [];
            mpesaPin = parsedData.mpesaPin || '1234';
            airtelPin = parsedData.airtelPin || '5678';
            telekomPin = parsedData.telekomPin || '9012';
            mpesaBalance = parsedData.mpesaBalance || 15000;
            airtelBalance = parsedData.airtelBalance || 8000;
            telekomBalance = parsedData.telekomBalance || 5000;
            
            // Convert string dates back to Date objects
            transactionHistory.forEach(t => {
                if (typeof t.date === 'string') {
                    t.date = new Date(t.date);
                }
            });
        } catch (e) {
            console.error("Error loading saved data:", e);
            initializeSampleData();
        }
    } else {
        initializeSampleData();
    }
}

function initializeSampleData() {
    transactionHistory = [
        { 
            service: 'mpesa', 
            type: 'Received', 
            from: '254712345678', 
            amount: 5000, 
            date: new Date(Date.now() - 86400000),
            balance: 15000,
            description: 'Received from 254712345678'
        },
        { 
            service: 'mpesa', 
            type: 'Sent', 
            to: '254798765432', 
            amount: 2000, 
            date: new Date(Date.now() - 172800000),
            balance: 10000,
            description: 'Sent to 254798765432'
        },
        { 
            service: 'airtel', 
            type: 'Airtime', 
            to: 'Self', 
            amount: 100, 
            date: new Date(Date.now() - 259200000),
            balance: 8000,
            description: 'Airtime for Self'
        },
        { 
            service: 'telekom', 
            type: 'Withdrawal', 
            amount: 1000, 
            date: new Date(Date.now() - 345600000),
            balance: 5000,
            description: 'Withdrawal from agent'
        }
    ];
    saveData();
}

function saveData() {
    const dataToSave = {
        transactionHistory: transactionHistory.map(t => ({
            ...t,
            date: t.date.toISOString()
        })),
        mpesaPin,
        airtelPin,
        telekomPin,
        mpesaBalance,
        airtelBalance,
        telekomBalance
    };
    localStorage.setItem('ussdSimulatorData', JSON.stringify(dataToSave));
}

function resetAllData() {
    if (confirm("Are you sure you want to reset all data? This will delete all transaction history and reset balances.")) {
        localStorage.removeItem('ussdSimulatorData');
        initializeSampleData();
        showMainMenu();
        addToDisplay('<div class="ussd-message">All data has been reset to default values.</div>');
    }
}

function clearDisplay() {
    const display = document.getElementById('ussd-display');
    display.innerHTML = '';
}

function addToDisplay(content, type = 'message') {
    const display = document.getElementById('ussd-display');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ussd-${type}`;
    messageDiv.innerHTML = content;
    display.appendChild(messageDiv);
    display.scrollTop = display.scrollHeight;
}

function showMainMenu() {
    clearDisplay();
    currentMenu = 'main';
    addToDisplay(`
        <div class="welcome-message">
            <h2>USSD Simulator</h2>
            <p>Select a service to begin:</p>
        </div>
        <div class="menu-options">
            <button onclick="selectService('mpesa')">1. M-Pesa (Safaricom)</button>
            <button onclick="selectService('airtel')">2. Airtel Money</button>
            <button onclick="selectService('telekom')">3. Telekom Money</button>
            <button onclick="resetAllData()" style="background-color: #ff4444; color: white; margin-top: 20px;">Reset All Data</button>
        </div>
    `);
}

function getServiceName(service) {
    switch(service) {
        case 'mpesa': return 'M-Pesa';
        case 'airtel': return 'Airtel Money';
        case 'telekom': return 'Telekom Money';
        default: return 'Mobile Money';
    }
}

function selectService(service) {
    currentService = service;
    currentMenu = 'service-main';
    clearDisplay();
    
    const display = document.getElementById('ussd-display');
    display.className = 'ussd-display';
    if (service === 'mpesa') display.classList.add('mpesa-theme');
    if (service === 'airtel') display.classList.add('airtel-theme');
    if (service === 'telekom') display.classList.add('telekom-theme');
    
    const serviceName = getServiceName(service);
    addToDisplay(`
        <div class="welcome-message">
            <h2>${serviceName}</h2>
        </div>
        <div class="menu-options">
            <button onclick="showServiceMenu('send-money')">1. Send Money</button>
            <button onclick="showServiceMenu('withdraw')">2. Withdraw Cash</button>
            <button onclick="showServiceMenu('buy-airtime')">3. Buy Airtime</button>
            <button onclick="showServiceMenu('lipa')">4. Lipa na ${serviceName}</button>
            <button onclick="showServiceMenu('account')">5. My Account</button>
            <button onclick="showMainMenu()">0. Back</button>
        </div>
    `);
}

function showServiceMenu(menu) {
    currentMenu = menu;
    clearDisplay();
    
    const serviceName = getServiceName(currentService);
    
    switch(menu) {
        case 'send-money':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Send Money</p>
                </div>
                <div class="ussd-prompt">
                    <p>Enter phone number:</p>
                </div>
            `);
            break;
            
        case 'withdraw':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Withdraw Cash</p>
                </div>
                <div class="menu-options">
                    <button onclick="showServiceMenu('withdraw-agent')">1. From ${serviceName} Agent</button>
                    <button onclick="showServiceMenu('withdraw-atm')">2. From ATM</button>
                    <button onclick="selectService(currentService)">0. Back</button>
                </div>
            `);
            break;
            
        case 'withdraw-agent':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Withdraw from Agent</p>
                </div>
                <div class="ussd-prompt">
                    <p>Enter agent number:</p>
                </div>
            `);
            break;
            
        case 'withdraw-atm':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Withdraw from ATM</p>
                </div>
                <div class="ussd-prompt">
                    <p>Enter amount:</p>
                </div>
            `);
            break;
            
        case 'buy-airtime':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Buy Airtime</p>
                </div>
                <div class="menu-options">
                    <button onclick="showServiceMenu('airtime-self')">1. My Number</button>
                    <button onclick="showServiceMenu('airtime-other')">2. Other Number</button>
                    <button onclick="selectService(currentService)">0. Back</button>
                </div>
            `);
            break;
            
        case 'airtime-self':
        case 'airtime-other':
            const promptText = menu === 'airtime-self' ? 'Enter amount:' : 'Enter phone number:';
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Buy Airtime ${menu === 'airtime-self' ? 'for Self' : 'for Other'}</p>
                </div>
                <div class="ussd-prompt">
                    <p>${promptText}</p>
                </div>
            `);
            break;
            
        case 'lipa':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Lipa na ${serviceName}</p>
                </div>
                <div class="menu-options">
                    <button onclick="showServiceMenu('paybill')">1. Paybill</button>
                    <button onclick="showServiceMenu('buy-goods')">2. Buy Goods & Services</button>
                    <button onclick="selectService(currentService)">0. Back</button>
                </div>
            `);
            break;
            
        case 'paybill':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Paybill</p>
                </div>
                <div class="ussd-prompt">
                    <p>Enter paybill number:</p>
                </div>
            `);
            break;
            
        case 'buy-goods':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Buy Goods & Services</p>
                </div>
                <div class="ussd-prompt">
                    <p>Enter till number:</p>
                </div>
            `);
            break;
            
        case 'account':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>My Account</p>
                </div>
                <div class="menu-options">
                    <button onclick="showServiceMenu('mini-statement')">1. Mini Statement</button>
                    <button onclick="showServiceMenu('change-pin')">2. ${serviceName} PIN Manager</button>
                    <button onclick="showServiceMenu('check-balance')">3. Check Balance</button>
                    <button onclick="selectService(currentService)">0. Back</button>
                </div>
            `);
            break;
            
        case 'mini-statement':
            showMiniStatement();
            break;
            
        case 'change-pin':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Change ${serviceName} PIN</p>
                </div>
                <div class="ussd-prompt">
                    <p>Enter current PIN:</p>
                </div>
            `);
            break;
            
        case 'check-balance':
            addToDisplay(`
                <div class="ussd-message">
                    <p><strong>${serviceName}</strong></p>
                    <p>Check Balance</p>
                </div>
                <div class="ussd-prompt">
                    <p>Enter ${serviceName} PIN:</p>
                </div>
            `);
            break;
    }
}

function processInput(input) {
    if (currentMenu === 'main') {
        if (input === '1') selectService('mpesa');
        else if (input === '2') selectService('airtel');
        else if (input === '3') selectService('telekom');
        else addToDisplay('Invalid selection. Please try again.', 'error');
        return;
    }
    
    const serviceName = getServiceName(currentService);
    
    switch(currentMenu) {
        case 'service-main':
            if (input === '1') showServiceMenu('send-money');
            else if (input === '2') showServiceMenu('withdraw');
            else if (input === '3') showServiceMenu('buy-airtime');
            else if (input === '4') showServiceMenu('lipa');
            else if (input === '5') showServiceMenu('account');
            else if (input === '0') showMainMenu();
            else addToDisplay('Invalid selection. Please try again.', 'error');
            break;
            
        case 'send-money':
            if (!input || input.length < 9) {
                addToDisplay('Please enter a valid phone number (9+ digits)', 'error');
                return;
            }
            transactionData = { type: 'send-money', phone: input };
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter amount to send to ${input}:</p>
                </div>
            `);
            currentMenu = 'send-money-amount';
            break;
            
        case 'send-money-amount':
            if (!input || isNaN(input) || input <= 0) {
                addToDisplay('Please enter a valid amount (greater than 0)', 'error');
                return;
            }
            transactionData.amount = parseFloat(input);
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter ${serviceName} PIN to send KES ${input} to ${transactionData.phone}:</p>
                </div>
            `);
            currentMenu = 'send-money-pin';
            break;
            
        case 'send-money-pin':
            if (!validatePin(input)) {
                addToDisplay('Invalid PIN. Please try again.', 'error');
                return;
            }
            completeTransaction('Sent', `KES ${transactionData.amount} sent to ${transactionData.phone}`);
            break;
            
        case 'withdraw-agent':
            if (!input || input.length < 6) {
                addToDisplay('Please enter a valid agent number (6+ digits)', 'error');
                return;
            }
            transactionData = { type: 'withdraw-agent', agent: input };
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter amount to withdraw from agent ${input}:</p>
                </div>
            `);
            currentMenu = 'withdraw-agent-amount';
            break;
            
        case 'withdraw-agent-amount':
            if (!input || isNaN(input) || input <= 0) {
                addToDisplay('Please enter a valid amount (greater than 0)', 'error');
                return;
            }
            transactionData.amount = parseFloat(input);
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter ${serviceName} PIN to withdraw KES ${input} from agent ${transactionData.agent}:</p>
                </div>
            `);
            currentMenu = 'withdraw-agent-pin';
            break;
            
        case 'withdraw-agent-pin':
            if (!validatePin(input)) {
                addToDisplay('Invalid PIN. Please try again.', 'error');
                return;
            }
            completeTransaction('Withdrawal', `KES ${transactionData.amount} withdrawn from agent ${transactionData.agent}`);
            break;
            
        case 'withdraw-atm':
            if (!input || isNaN(input) || input <= 0) {
                addToDisplay('Please enter a valid amount (greater than 0)', 'error');
                return;
            }
            transactionData = { type: 'withdraw-atm', amount: parseFloat(input) };
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter ${serviceName} PIN to withdraw KES ${input} from ATM:</p>
                </div>
            `);
            currentMenu = 'withdraw-atm-pin';
            break;
            
        case 'withdraw-atm-pin':
            if (!validatePin(input)) {
                addToDisplay('Invalid PIN. Please try again.', 'error');
                return;
            }
            completeTransaction('ATM Withdrawal', `KES ${transactionData.amount} withdrawn from ATM`);
            break;
            
        case 'airtime-self':
            if (!input || isNaN(input) || input <= 0) {
                addToDisplay('Please enter a valid amount (greater than 0)', 'error');
                return;
            }
            transactionData = { type: 'airtime-self', amount: parseFloat(input) };
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter ${serviceName} PIN to buy airtime worth KES ${input} for your number:</p>
                </div>
            `);
            currentMenu = 'airtime-self-pin';
            break;
            
        case 'airtime-self-pin':
            if (!validatePin(input)) {
                addToDisplay('Invalid PIN. Please try again.', 'error');
                return;
            }
            completeTransaction('Airtime Self', `Airtime worth KES ${transactionData.amount} purchased`);
            break;
            
        case 'airtime-other':
            if (!input || input.length < 9) {
                addToDisplay('Please enter a valid phone number (9+ digits)', 'error');
                return;
            }
            transactionData = { type: 'airtime-other', phone: input };
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter amount for airtime to ${input}:</p>
                </div>
            `);
            currentMenu = 'airtime-other-amount';
            break;
            
        case 'airtime-other-amount':
            if (!input || isNaN(input) || input <= 0) {
                addToDisplay('Please enter a valid amount (greater than 0)', 'error');
                return;
            }
            transactionData.amount = parseFloat(input);
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter ${serviceName} PIN to buy airtime worth KES ${input} for ${transactionData.phone}:</p>
                </div>
            `);
            currentMenu = 'airtime-other-pin';
            break;
            
        case 'airtime-other-pin':
            if (!validatePin(input)) {
                addToDisplay('Invalid PIN. Please try again.', 'error');
                return;
            }
            completeTransaction('Airtime Other', `Airtime worth KES ${transactionData.amount} sent to ${transactionData.phone}`);
            break;
            
        case 'paybill':
            if (!input || input.length < 5) {
                addToDisplay('Please enter a valid paybill number (5+ digits)', 'error');
                return;
            }
            transactionData = { type: 'paybill', paybill: input };
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter account number for paybill ${input}:</p>
                </div>
            `);
            currentMenu = 'paybill-account';
            break;
            
        case 'paybill-account':
            if (!input) {
                addToDisplay('Please enter account number', 'error');
                return;
            }
            transactionData.account = input;
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter amount for paybill ${transactionData.paybill} account ${input}:</p>
                </div>
            `);
            currentMenu = 'paybill-amount';
            break;
            
        case 'paybill-amount':
            if (!input || isNaN(input) || input <= 0) {
                addToDisplay('Please enter a valid amount (greater than 0)', 'error');
                return;
            }
            transactionData.amount = parseFloat(input);
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter ${serviceName} PIN to pay KES ${input} to paybill ${transactionData.paybill} account ${transactionData.account}:</p>
                </div>
            `);
            currentMenu = 'paybill-pin';
            break;
            
        case 'paybill-pin':
            if (!validatePin(input)) {
                addToDisplay('Invalid PIN. Please try again.', 'error');
                return;
            }
            completeTransaction('Paybill', `KES ${transactionData.amount} paid to paybill ${transactionData.paybill} (Account: ${transactionData.account})`);
            break;
            
        case 'buy-goods':
            if (!input || input.length < 5) {
                addToDisplay('Please enter a valid till number (5+ digits)', 'error');
                return;
            }
            transactionData = { type: 'buy-goods', till: input };
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter amount for till ${input}:</p>
                </div>
            `);
            currentMenu = 'buy-goods-amount';
            break;
            
        case 'buy-goods-amount':
            if (!input || isNaN(input) || input <= 0) {
                addToDisplay('Please enter a valid amount (greater than 0)', 'error');
                return;
            }
            transactionData.amount = parseFloat(input);
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter ${serviceName} PIN to pay KES ${input} to till ${transactionData.till}:</p>
                </div>
            `);
            currentMenu = 'buy-goods-pin';
            break;
            
        case 'buy-goods-pin':
            if (!validatePin(input)) {
                addToDisplay('Invalid PIN. Please try again.', 'error');
                return;
            }
            completeTransaction('Buy Goods', `KES ${transactionData.amount} paid to till ${transactionData.till}`);
            break;
            
        case 'change-pin':
            if (!validatePin(input)) {
                addToDisplay('Invalid current PIN. Please try again.', 'error');
                return;
            }
            addToDisplay(`
                <div class="ussd-response">
                    <p>Enter new ${serviceName} PIN:</p>
                </div>
            `);
            currentMenu = 'change-pin-new';
            break;
            
        case 'change-pin-new':
            if (!input || input.length !== 4 || isNaN(input)) {
                addToDisplay('PIN must be 4 digits. Please try again.', 'error');
                return;
            }
            addToDisplay(`
                <div class="ussd-response">
                    <p>Confirm new ${serviceName} PIN:</p>
                </div>
            `);
            transactionData = { newPin: input };
            currentMenu = 'change-pin-confirm';
            break;
            
        case 'change-pin-confirm':
            if (input !== transactionData.newPin) {
                addToDisplay('PINs do not match. Please try again.', 'error');
                showServiceMenu('change-pin');
                return;
            }
            updatePin(transactionData.newPin);
            addToDisplay(`
                <div class="ussd-message">
                    <p>Your ${serviceName} PIN has been changed successfully.</p>
                </div>
                <button onclick="selectService(currentService)" class="menu-options">0. Back</button>
            `);
            break;
            
        case 'check-balance':
            if (!validatePin(input)) {
                addToDisplay('Invalid PIN. Please try again.', 'error');
                return;
            }
            showBalance();
            break;
    }
}

function validatePin(pin) {
    if (currentService === 'mpesa') return pin === mpesaPin;
    if (currentService === 'airtel') return pin === airtelPin;
    if (currentService === 'telekom') return pin === telekomPin;
    return false;
}

function updatePin(newPin) {
    if (currentService === 'mpesa') mpesaPin = newPin;
    if (currentService === 'airtel') airtelPin = newPin;
    if (currentService === 'telekom') telekomPin = newPin;
    saveData();
}

function completeTransaction(type, description) {
    const amount = transactionData.amount || 0;
    let newBalance;
    
    if (currentService === 'mpesa') {
        mpesaBalance -= amount;
        newBalance = mpesaBalance;
    } else if (currentService === 'airtel') {
        airtelBalance -= amount;
        newBalance = airtelBalance;
    } else if (currentService === 'telekom') {
        telekomBalance -= amount;
        newBalance = telekomBalance;
    }
    
    const transaction = {
        service: currentService,
        type: type,
        amount: amount,
        date: new Date(),
        balance: newBalance,
        description: description
    };
    
    if (transactionData.phone) transaction.to = transactionData.phone;
    if (transactionData.agent) transaction.agent = transactionData.agent;
    if (transactionData.paybill) transaction.paybill = transactionData.paybill;
    if (transactionData.account) transaction.account = transactionData.account;
    if (transactionData.till) transaction.till = transactionData.till;
    
    transactionHistory.unshift(transaction);
    saveData();
    
    addToDisplay(`
        <div class="confirmation-details">
            <p><strong>Transaction successful</strong></p>
            <p>${description}</p>
            <p>New balance: KES ${newBalance.toLocaleString()}</p>
            <p>Date: ${new Date().toLocaleString()}</p>
        </div>
        <button onclick="selectService(currentService)" class="menu-options">0. Back</button>
    `);
}

function showBalance() {
    let balance;
    if (currentService === 'mpesa') balance = mpesaBalance;
    if (currentService === 'airtel') balance = airtelBalance;
    if (currentService === 'telekom') balance = telekomBalance;
    
    addToDisplay(`
        <div class="confirmation-details">
            <p><strong>${getServiceName(currentService)} Balance</strong></p>
            <p>Available balance: KES ${balance.toLocaleString()}</p>
            <p>Date: ${new Date().toLocaleString()}</p>
        </div>
        <button onclick="selectService(currentService)" class="menu-options">0. Back</button>
    `);
}

function showMiniStatement() {
    const serviceTransactions = transactionHistory
        .filter(t => t.service === currentService)
        .slice(0, 5)
        .sort((a, b) => b.date - a.date);
    
    let statementHtml = `
        <div class="ussd-message">
            <p><strong>${getServiceName(currentService)} Mini Statement</strong></p>
            <p>Last 5 transactions:</p>
        </div>
        <div class="transaction-history">
    `;
    
    if (serviceTransactions.length === 0) {
        statementHtml += `<p>No transactions found</p>`;
    } else {
        serviceTransactions.forEach(transaction => {
            const amountClass = transaction.type === 'Received' ? 'received' : '';
            statementHtml += `
                <div class="transaction-item">
                    <div>
                        <span class="transaction-type">${transaction.type}</span>
                        <p>${transaction.description || ''}</p>
                        <small>${transaction.date.toLocaleString()}</small>
                    </div>
                    <div class="transaction-amount ${amountClass}">KES ${transaction.amount.toLocaleString()}</div>
                </div>
            `;
        });
    }
    
    statementHtml += `
        </div>
        <button onclick="selectService(currentService)" class="menu-options">0. Back</button>
    `;
    
    addToDisplay(statementHtml);
}

function pressKey(key) {
    inputBuffer += key;
    addToDisplay(`<div class="ussd-response">Entered: ${'*'.repeat(inputBuffer.length)}</div>`);
}

function sendAction() {
    processInput(inputBuffer);
    inputBuffer = '';
}

function backAction() {
    if (inputBuffer.length > 0) {
        inputBuffer = inputBuffer.slice(0, -1);
        addToDisplay(`<div class="ussd-response">Entered: ${'*'.repeat(inputBuffer.length)}</div>`);
    } else {
        if (currentMenu === 'main') return;
        
        const menuParts = currentMenu.split('-');
        if (menuParts.length > 1) {
            const parentMenu = menuParts.slice(0, -1).join('-');
            showServiceMenu(parentMenu);
        } else {
            selectService(currentService);
        }
    }
}

window.onload = function() {
    initializeData();
    showMainMenu();
};