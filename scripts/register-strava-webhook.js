#!/usr/bin/env node

// Strava Webhook Registration Script
// This registers your app's webhook endpoint with Strava for real-time activity sync

const REPLIT_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : 'YOUR_REPLIT_URL'; // Replace with your Replit URL if env var not set

const CLIENT_ID = process.env.STRAVA_CLIENT_ID || '182162';
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '9db92ce1ec711e7eda22e93a538f0c3bc47e4222';
const VERIFY_TOKEN = 'FITSQUAD_WEBHOOK_2025';

async function registerWebhook() {
  console.log('🔗 Registering Strava webhook...');
  console.log(`📍 Callback URL: ${REPLIT_URL}/api/strava/webhook`);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    callback_url: `${REPLIT_URL}/api/strava/webhook`,
    verify_token: VERIFY_TOKEN
  });

  try {
    const response = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to register webhook:', response.status, errorText);
      
      if (response.status === 400 && errorText.includes('already exists')) {
        console.log('ℹ️  Webhook already registered. You\'re all set!');
        await listWebhooks();
      }
      return;
    }

    const data = await response.json();
    console.log('✅ Webhook registered successfully!');
    console.log('Subscription ID:', data.id);
    console.log('Created at:', data.created_at);
    console.log('\n🎉 You\'re all set! Activities will now sync automatically.');

  } catch (error) {
    console.error('❌ Error registering webhook:', error.message);
  }
}

async function listWebhooks() {
  console.log('\n📋 Checking existing webhooks...');

  try {
    const url = new URL('https://www.strava.com/api/v3/push_subscriptions');
    url.searchParams.set('client_id', CLIENT_ID);
    url.searchParams.set('client_secret', CLIENT_SECRET);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to list webhooks:', response.status);
      return;
    }

    const subscriptions = await response.json();
    
    if (subscriptions.length === 0) {
      console.log('No webhooks registered yet.');
    } else {
      console.log(`Found ${subscriptions.length} webhook(s):`);
      subscriptions.forEach((sub, i) => {
        console.log(`\n${i + 1}. Subscription ID: ${sub.id}`);
        console.log(`   Callback URL: ${sub.callback_url}`);
        console.log(`   Created: ${sub.created_at}`);
      });
    }
  } catch (error) {
    console.error('Error listing webhooks:', error.message);
  }
}

async function deleteWebhook(subscriptionId) {
  console.log(`🗑️  Deleting webhook ${subscriptionId}...`);

  try {
    const url = new URL(`https://www.strava.com/api/v3/push_subscriptions/${subscriptionId}`);
    url.searchParams.set('client_id', CLIENT_ID);
    url.searchParams.set('client_secret', CLIENT_SECRET);

    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      console.error('Failed to delete webhook:', response.status);
      return;
    }

    console.log('✅ Webhook deleted successfully');
  } catch (error) {
    console.error('Error deleting webhook:', error.message);
  }
}

// Main execution
const command = process.argv[2];

if (command === 'list') {
  listWebhooks();
} else if (command === 'delete' && process.argv[3]) {
  deleteWebhook(process.argv[3]);
} else if (command === 'help' || command === '--help' || command === '-h') {
  console.log(`
Strava Webhook Management Script

Usage:
  node scripts/register-strava-webhook.js           Register new webhook
  node scripts/register-strava-webhook.js list      List existing webhooks
  node scripts/register-strava-webhook.js delete <id>   Delete webhook by ID
  node scripts/register-strava-webhook.js help      Show this help

Examples:
  node scripts/register-strava-webhook.js
  node scripts/register-strava-webhook.js list
  node scripts/register-strava-webhook.js delete 123456
  `);
} else {
  registerWebhook();
}
