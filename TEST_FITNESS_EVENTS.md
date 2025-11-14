# Testing Fitness Events

## ✅ Quick Test Guide

### Step 1: Login to Your App
1. Go to `/admin` and login with PIN `9406` (superadmin)

### Step 2: Create a Test Trip
1. In the admin panel, create a new activity:
   - **Title**: "Squad Morning Run" 
   - **Type**: Trip
   - **Start Date**: Pick tomorrow or any future date
   - **End Date**: Same as start date
   - **Organizer**: Select yourself (Putra)
   - **Participants**: Select a few friends
   - **Location**: "KLCC Park"
   - Click **Add Activity**

### Step 3: Get the Activity ID
After creating the trip, you'll see it in the activities list. Right-click on it → Inspect Element, and find its UUID in the HTML attributes. Or:

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by "activities"
4. Look for the POST request response - you'll see the new activity's `id` field

### Step 4: Convert to Fitness Event
Open your browser console (F12 → Console tab) and run:

```javascript
// Replace YOUR-ACTIVITY-UUID-HERE with the actual ID from step 3
const activityId = 'YOUR-ACTIVITY-UUID-HERE'

fetch('/api/fitness-events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-auth-pin': '9406'
  },
  body: JSON.stringify({
    activityId: activityId,
    eventCategory: 'run',
    intensityLevel: 'moderate',
    meetupLocation: 'KLCC Park - Main Fountain',
    meetupNotes: 'Meet at 7am sharp! Bring water.',
    autoLogWorkouts: true,
    pointsOverride: 50
  })
})
.then(r => r.json())
.then(result => {
  console.log('✅ Fitness event created!', result)
})
.catch(err => {
  console.error('❌ Error:', err)
})
```

### Step 5: View & RSVP
1. Go to `/fitness` page
2. You should see your event under "UPCOMING EVENTS"!
3. Friends can click **Going** / **Maybe** / **Can't Make It** buttons to RSVP

### Step 6: Test Auto-Linking (After Event)
1. As organizer, you can check in participants (need to build UI, but API ready)
2. When friends complete Strava workouts on the event date, they'll automatically link and earn +50 bonus points!

---

## 🎯 Event Categories Available

- `run` - Group runs
- `ride` - Cycling events  
- `hike` - Hiking trips
- `race` - Competitive races
- `swim` - Swimming events
- `other` - Other fitness activities

## 🏃 Intensity Levels

- `easy` - Chill pace, beginner-friendly
- `moderate` - Regular workout pace
- `hard` - Challenging workout
- `race` - Competition mode!

## 🔒 Permissions

- **Anyone logged in** can RSVP to events
- **Organizers only** can edit their own events
- **Organizers only** can check in participants
- **Superadmin** can do everything

---

## Quick RSVP Test (As Friend)

```javascript
// Login as a friend first, then run:
fetch('/api/fitness-events/EVENT-ID-HERE/rsvp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-auth-pin': 'YOUR-FRIEND-PIN'
  },
  body: JSON.stringify({
    rsvpStatus: 'going'
  })
})
.then(r => r.json())
.then(console.log)
```

The system will automatically use the authenticated user's ID - no spoofing allowed! ✅
