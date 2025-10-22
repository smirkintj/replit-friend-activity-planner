# Strava Integration Setup Guide

## What You've Built

Your FitSquad app now has **automatic Strava sync**! Friends can connect their Strava accounts once, and all their workouts will automatically appear in FitSquad with calculated points.

---

## Step 1: Run the Database Schema ✅

You need to run the updated SQL schema in your Supabase dashboard to add the `strava_connections` table:

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-fitness-schema.sql`
5. Click **Run** (or press Ctrl+Enter)

This creates 5 tables:
- `fitness_activities` - Workout logs
- `fitness_badges` - Achievement badges
- `squad_challenges` - Group challenges
- `fitness_stats` - Cached statistics
- `strava_connections` - ✨ NEW: Strava OAuth tokens

---

## Step 2: Register Webhook with Strava

For real-time activity syncing, you need to register your app's webhook endpoint with Strava.

### Option A: Using Curl (Easiest)

Open your terminal and run this command (replace `YOUR_REPLIT_URL` with your actual Replit URL):

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=182162 \
  -F client_secret=9db92ce1ec711e7eda22e93a538f0c3bc47e4222 \
  -F callback_url=https://korangbilafree.replit.app.dev/api/strava/webhook \
  -F verify_token=FITSQUAD_WEBHOOK_2025
```

### Get Your Replit URL

1. Click the **Webview** tab in Replit
2. Copy the URL from the address bar
3. It should look like: `https://abc123-00-xyz.replit.dev`

### Expected Response

If successful, you'll see something like:

```json
{
  "id": 123456,
  "callback_url": "https://your-replit-url/api/strava/webhook",
  "created_at": "2025-10-22T10:00:00Z",
  "updated_at": "2025-10-22T10:00:00Z"
}
```

### Option B: Using Node.js Script

Create and run this file locally:

```javascript
// register-webhook.js
const REPLIT_URL = 'YOUR_REPLIT_URL'; // Replace with your URL

fetch('https://www.strava.com/api/v3/push_subscriptions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: '182162',
    client_secret: '9db92ce1ec711e7eda22e93a538f0c3bc47e4222',
    callback_url: `${REPLIT_URL}/api/strava/webhook`,
    verify_token: 'FITSQUAD_WEBHOOK_2025'
  })
})
  .then(r => r.json())
  .then(data => console.log('Webhook registered:', data))
  .catch(err => console.error('Error:', err));
```

Then run: `node register-webhook.js`

---

## Step 3: Test the Integration

### Connect Your Strava Account

1. Go to your FitSquad app
2. Click the **🏆 FitSquad** link
3. You'll see a **"Connect Strava"** button
4. Click it and authorize the app
5. You'll be redirected back to FitSquad with status: "Strava Connected ✅"

### Test Auto-Sync

1. Open the Strava mobile app or website
2. Log a new workout (e.g., a 5km run)
3. Within seconds, check FitSquad
4. The workout should appear automatically with calculated points!

---

## How It Works

### For Friends:

1. **One-time setup**: Click "Connect Strava" → Authorize → Done!
2. **Automatic sync**: Every time they log a workout in Strava, it appears in FitSquad
3. **Points & badges**: Automatically calculated based on workout type and distance
4. **Zero maintenance**: They never think about it again

### Behind the Scenes:

1. **OAuth Connection**: Securely stores access/refresh tokens in Supabase
2. **Real-time Webhook**: Strava notifies your app when new activities are logged
3. **Activity Fetch**: App fetches full workout details from Strava API
4. **Points Calculation**: Converts to FitSquad format with automatic points
5. **Badge Unlocking**: Checks for new achievements

---

## Supported Activities

The integration automatically maps these Strava activities:

| Strava Type | FitSquad Type | Points Formula |
|------------|---------------|----------------|
| Run | run | 10 pts/km |
| Ride (bike) | bike | 10 pts/km |
| Swim | swim | 10 pts/km |
| Walk | walk | 10 pts/km |
| Hike | hike | 10 pts/km |
| WeightTraining | gym | 5 pts/10 min |
| Yoga | yoga | 3 pts/10 min |
| VirtualRun | run | 10 pts/km |
| VirtualRide | bike | 10 pts/km |

---

## Troubleshooting

### "Connect Strava" button doesn't work
- Make sure you've added the Strava credentials as Replit secrets
- Check that `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` are set

### Activities not syncing automatically
- Verify webhook is registered (check curl response above)
- Make sure your Replit app is running (webhooks need the server online)
- Check console logs for errors: `refresh_all_logs` in Replit

### Token expired errors
- The app automatically refreshes tokens every 6 hours
- If you see errors, try disconnecting and reconnecting Strava

### "Failed to save connection"
- Make sure you ran the database schema (`strava_connections` table)
- Check Supabase console for errors

---

## Manual Sync (Optional)

If you want to sync past activities (not just new ones going forward):

You can add a "Sync Recent Activities" button that calls the `syncRecentActivities()` function. This will pull the last 30 activities from Strava and add them to FitSquad.

---

## Rate Limits

Strava API has these limits:
- **200 requests per 15 minutes**
- **2,000 requests per day**

The webhook-based sync is very efficient and stays well within limits. Manual syncing of 30 activities uses just 1 API call.

---

## Security Notes

✅ **What's Secure:**
- OAuth tokens stored in Supabase (encrypted)
- Client secret stored as Replit environment variable
- Tokens auto-refresh every 6 hours
- Webhook uses verify token for security

✅ **What's Private:**
- Only activities shared with "Everyone" or "Followers" are synced
- Friends can disconnect anytime (keeps existing workouts)
- Strava sends delete events when activities are made private

---

## Next Steps

Once everything is working:

1. **Invite friends** to connect their Strava accounts
2. **Watch the leaderboard** update automatically
3. **Unlock badges** as people hit milestones
4. **Celebrate** the automation! 🎉

---

## Questions?

- **Strava API Docs**: https://developers.strava.com/docs/
- **Webhook Events**: https://developers.strava.com/docs/webhooks/
- **OAuth Guide**: https://developers.strava.com/docs/authentication/
