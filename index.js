const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

// ========== AAPKE CHANNEL AUR GROUP KE NAAM ==========
const CHANNEL_KA_NAAM = "Tradingpapa.com forex (gold and silver)";
const GROUP_KA_NAAM = "FOREX";
// ====================================================

// Keep-alive server (taake Render bot ko 24/7 on rakhe)
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('✅ Forex WhatsApp Forwarder Bot Bilkul Active Hai!');
});

app.listen(PORT, () => {
    console.log(`🌐 Server Port ${PORT} par chal raha hai.`);
});

// WhatsApp Bot Client Setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Jab QR Code aaye scan karne ke liye
client.on('qr', (qr) => {
    console.log('\n========================================');
    console.log('📱 APNE PHONE SE NEECHE WALA QR SCAN KAREIN:');
    console.log('WhatsApp > Settings > Linked Devices > Link a Device');
    console.log('========================================\n');
    qrcode.generate(qr, { small: true });
    console.log('\n========================================\n');
});

// Jab WhatsApp successfully connect ho jaye
client.on('ready', () => {
    console.log('🚀 BOT ACTIVE HO GAYA HAI!');
    console.log(`📢 Target Channel: "${CHANNEL_KA_NAAM}"`);
    console.log(`📥 Target Group: "${GROUP_KA_NAAM}"`);
    console.log('⚡ Messages, Signals, Videos aur Photos ab turant forward honge.');
});

// Message sunne aur forward karne ka logic
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        const chatName = chat.name ? chat.name.trim().toLowerCase() : '';
        const targetChannel = CHANNEL_KA_NAAM.trim().toLowerCase();

        // Check karega agar msg Channel se aya hai (name match)
        if (chatName.includes(targetChannel) || targetChannel.includes(chatName)) {
            console.log(`⚡ Naya Message/Signal Channel se aya: [${msg.type.toUpperCase()}]`);

            // FOREX Group ko dhoondein
            const allChats = await client.getChats();
            const targetGroup = allChats.find(
                c => c.isGroup && c.name.trim().toLowerCase() === GROUP_KA_NAAM.trim().toLowerCase()
            );

            if (targetGroup) {
                // Immediately forward to FOREX group
                await msg.forward(targetGroup);
                console.log(`✅ INSTANTLY FORWARDED TO "${GROUP_KA_NAAM}" GROUP!`);
            } else {
                console.log(`❌ Error: Group "${GROUP_KA_NAAM}" nahi mila. Please check karein ke group bana hua hai ya nahi.`);
            }
        }
    } catch (err) {
        console.error('⚠️ Forwarding Error:', err.message);
    }
});

// Bot ko start karein
client.initialize();
