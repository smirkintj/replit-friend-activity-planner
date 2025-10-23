# FitSquad Feature Concepts

## 1. Points-Based Tier System

### Overview
A weekly points tier system that rewards consistent effort and intensity, complementing the existing streak-based system.

### Tier Structure
Based on **weekly points** (Monday-Sunday):

| Tier | Min Points | Emoji | Description |
|------|------------|-------|-------------|
| **Beginner** | 50+ | 🌱 | Getting started on your fitness journey |
| **Active** | 100+ | 💪 | Consistently showing up and putting in the work |
| **Committed** | 200+ | 🔥 | Dedicated to the grind, week after week |
| **Champion** | 300+ | 👑 | Elite performance, crushing your goals |
| **Elite** | 500+ | ⭐ | Among the best, relentless dedication |
| **Legend** | 750+ | 🏆 | Legendary status, unmatched commitment |

### Cosmetic Rewards

Each tier unlocks unique visual effects:

- **Beginner**: No cosmetics (clean baseline)
- **Active**: Subtle glow effect, blue profile frame
- **Committed**: Glow + floating particles, pulse animation, gradient text, amber frame
- **Champion**: Enhanced glow + particles, bounce animation, gradient text, purple frame
- **Elite**: Intense glow + particles, float animation, gradient text, rainbow border
- **Legend**: Maximum effects + shimmer animation, animated rainbow border

### Implementation Ideas

**Display Locations:**
- **YOUR WEEK section**: Show current tier badge prominently
- **Leaderboard**: Tier icon next to each person's name
- **Profile**: Tier history ("You've achieved Champion 8 times!")

**Real-time Updates:**
- Tier dynamically updates as points are earned throughout the week
- Resets every Monday (aligns with weekly leaderboard)
- Celebration animation when reaching a new tier

---

## 2. Championship History Tracking

### Overview
Track and display which weeks each friend was the champion (ranked #1 on leaderboard).

### Database Schema
```typescript
interface WeekChampion {
  id: string
  friendId: string
  year: number // e.g., 2025
  weekNumber: number // 1-52
  points: number
  margin: number // Points ahead of 2nd place
  createdAt: string
}
```

### Data Structure
```typescript
// Example record
{
  id: "uuid",
  friendId: "putra_id",
  year: 2025,
  weekNumber: 52,
  points: 450,
  margin: 75, // 75 points ahead of 2nd place
  createdAt: "2025-12-30T00:00:00Z"
}
```

### Display Ideas

**On Friend Profiles:**
```
🏆 Championship History

Week 52 '25 Champion (450 pts)
Week 48 '25 Champion (380 pts)
Week 42 '25 Champion (520 pts)

Total Championships: 12
Longest winning streak: 3 weeks (Week 22-24 '25)
Highest margin: 120 pts (Week 15 '25)
```

**Championship Stats Card:**
- Total championships won
- Win rate (% of weeks participated)
- Longest winning streak
- Biggest point margin
- Average championship points

**Hall of Fame:**
- All-time championship leaderboard
- Most championships by person
- Longest streaks
- Biggest blowouts

### Implementation
```typescript
// Auto-record champion at end of each week (Monday 00:00)
// Can be done via cron job or manual admin action

async function recordWeeklyChampion() {
  const leaderboard = await getWeeklyLeaderboard()
  const champion = leaderboard[0]
  
  if (champion.points > 0) {
    await createWeekChampionRecord({
      friendId: champion.friendId,
      year: new Date().getFullYear(),
      weekNumber: getWeekNumber(new Date()),
      points: champion.points,
      margin: champion.points - (leaderboard[1]?.points || 0)
    })
  }
}
```

---

## 3. Calendar Date Picker for Workout Logging

### Overview
Allow users to select any past date when logging workouts, not just today.

### Features
- **Date Range**: Can log workouts from Jan 1, 2024 to today
- **Cannot future-date**: Prevents logging workouts that haven't happened yet
- **Calendar UI**: Clean popover with calendar for easy date selection
- **Default**: Still defaults to today for convenience

### Use Cases
- Forgot to log yesterday's workout → can backfill
- Batch entering multiple past workouts
- Correcting dates on accidentally mis-logged activities

---

## 4. Leaderboard Zero-Point Filtering

### Overview
Hide friends with 0 points from "Anugerah Terpaling Sihat" to keep it clean.

### Logic
- **Champion card**: Always shown (even if 0 points - edge case for empty week)
- **Rest of leaderboard**: Only show friends with points > 0
- **Benefits**: 
  - Cleaner UI
  - Highlights active participants
  - Reduces scrolling on mobile

---

## Implementation Priority

1. ✅ **Calendar Date Picker** - Quick win, immediate user value
2. ✅ **Zero-Point Filtering** - Simple, improves UX
3. 📝 **Points Tier System** - Medium complexity, high engagement
4. 📝 **Championship History** - Requires database migration, highest effort

---

## Future Enhancements

### Points Tier Ideas
- **Monthly tiers**: Separate system for monthly total points
- **Tier milestones**: Special badges for hitting each tier X times
- **Tier challenges**: "Maintain Elite for 4 consecutive weeks"

### Championship Ideas
- **Title defense**: Current champion gets crown icon all week
- **Championship playoffs**: Top 3 compete for bonus points
- **Season championships**: Q1, Q2, Q3, Q4 champions

### Gamification
- **Point multipliers**: 1.5x on weekends, 2x on challenge days
- **Combo streaks**: Bonus for working out multiple days in a row
- **Social challenges**: Team vs team, group goals
