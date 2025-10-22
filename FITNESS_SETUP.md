# FitSquad Setup Instructions

## 🏋️ Welcome to FitSquad!

Your new fitness tracking feature is ready to go! Just follow these simple steps:

## Step 1: Create Database Tables

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Open the file `supabase-fitness-schema.sql` from your project
5. Copy all the SQL code
6. Paste it into the SQL Editor
7. Click **Run** or press `Ctrl/Cmd + Enter`

You should see a success message! This creates 4 new tables:
- `fitness_activities` - Stores workout data
- `fitness_badges` - Tracks unlocked achievements
- `squad_challenges` - Group fitness challenges
- `fitness_stats` - Cached weekly/monthly stats

## Step 2: Access FitSquad

Once the database tables are created, you can access FitSquad in two ways:

1. **From the homepage**: Click the "🏆 FitSquad" button in the header
2. **Direct link**: Navigate to `/fitness` in your browser

## Features Included

### ✅ Manual Workout Logging
- Quick form to log runs, gym sessions, cycling, swimming, yoga, and more
- Auto-calculates points based on activity type and duration
- Distance tracking for cardio activities

### ✅ Points System
- **Cardio** (run/bike/swim/walk/hike): 10 points per km
- **Strength** (gym): 5 points per 10 minutes
- **Recovery** (yoga/other): 3 points per 10 minutes
- **Streak bonuses**: +20 points for 3 days, +50 for 7 days
- **First of the day**: +20 bonus points

### ✅ Weekly Leaderboard
- Real-time rankings based on weekly points
- Gold/silver/bronze visual styling for top 3
- Shows workouts, distance, and streaks
- Badge count display

### ✅ Badge System
17 unlockable achievements across 4 categories:

**🏃 Cardio Badges**:
- First Steps, 5K Runner, 10K Champion, Marathon Runner, Century Cyclist, Ocean Swimmer

**💪 Strength Badges**:
- Iron Lifter, Beast Mode, Diamond Grinder

**🔥 Streak Badges**:
- Hot Streak (3 days), Lightning Streak (7 days), Unstoppable (30 days)

**⭐ Special Badges**:
- Night Owl, Early Bird, Weekend Warrior, 100 Club

### ✅ Personal Dashboard
- Weekly calendar view showing workout days
- Total points, workouts, and distance
- Current streak counter
- Badge collection display

### ✅ Activity Feed
- Recent workouts from all friends
- Shows who did what, when
- Points earned per activity

## Next Steps (Future Enhancements)

Ready to add more features? Here are some ideas:

### Phase 2: Strava Integration
- Auto-sync workouts from Strava
- Real-time notifications when friends finish workouts
- Webhook support for instant updates

### Phase 3: Advanced Features
- Custom squad challenges
- Monthly leaderboards
- Advanced stats visualization
- Photo uploads with workouts
- Direct friend challenges (1v1)

## Troubleshooting

**Q: I don't see any data in FitSquad**
A: Make sure you've run the SQL schema in Supabase first!

**Q: The page shows an error**
A: Check your browser console for errors. Make sure your Supabase credentials are set up correctly.

**Q: How do I add workouts for different friends?**
A: Click "Log Workout" and select the friend from the dropdown. If you're logged in as a friend (not superadmin), it defaults to your account.

**Q: Can I edit or delete workouts?**
A: Not yet! This is a planned feature for the next update. For now, you can manually delete from Supabase if needed.

## Have Fun! 🎉

Start logging workouts, compete with your friends, and unlock all the badges! May the best friend win! 💪🏆
