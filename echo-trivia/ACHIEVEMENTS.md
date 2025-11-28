# Achievement System Documentation

## How Achievements Are Awarded

Achievements are **automatically awarded** when users complete quizzes. The system ensures users receive all achievements they've earned through a database function that runs after every quiz submission.

### Award Flow

```
User completes quiz
    ↓
Quiz submitted to Supabase (/api/quiz/submit)
    ↓
Quiz session saved to database
    ↓
check_and_award_achievements() function is called
    ↓
Function checks ALL achievement criteria
    ↓
Awards any newly unlocked achievements
    ↓
Returns newly earned achievements to user
```

### When Achievements Are Checked

**Every time** a quiz is completed, the `check_and_award_achievements()` PostgreSQL function:
1. Retrieves all quiz statistics for the user
2. Checks EVERY achievement condition
3. Awards any achievements that are unlocked but not yet awarded
4. Uses `ON CONFLICT DO NOTHING` to prevent duplicate awards

This means:
- ✅ Users can never miss an achievement
- ✅ Achievements are awarded retroactively (if you already met the criteria)
- ✅ No manual intervention needed
- ✅ Achievements check on every quiz completion

### Code Location

**Backend Logic:**
- Database Function: `supabase/migrations/001_initial_schema.sql` (original 5)
- New Achievements: `supabase/migrations/002_add_more_achievements.sql` (new 5)
- API Endpoint: `src/app/api/quiz/submit/route.ts`

**Frontend Display:**
- Dashboard: `src/app/(trivia)/dashboard/page.tsx`
- Profile: `src/app/(trivia)/profile/page.tsx`

## All Achievements (11 Total)

Ordered by tier from Bronze to Platinum:

### 🥉 Bronze Tier (2)
| ID | Name | Description | Icon | Criteria |
|---|---|---|---|---|
| `first_steps` | First Steps | Complete your first quiz | 🎯 | Complete 1 quiz |
| `daily_devotee` | Daily Devotee | Complete a daily challenge | 📅 | Complete 1 daily quiz |

### 🥈 Silver Tier (3)
| ID | Name | Description | Icon | Criteria |
|---|---|---|---|---|
| `perfect_score` | Perfect Score | Achieve 100% on any quiz | 💯 | Score 100% on any quiz |
| `hard_mode_master` | Hard Mode Master | Complete a quiz on hard difficulty | 💪 | Complete a quiz with difficulty='hard' |
| `quiz_marathon` | Quiz Marathon | Complete 5 quizzes in one day | 🏃 | Complete 5 quizzes on the same day |

### 🥇 Gold Tier (3)
| ID | Name | Description | Icon | Criteria |
|---|---|---|---|---|
| `streak_master` | Streak Master | Maintain a 7-day streak | 🔥 | Have current_streak >= 7 |
| `speed_demon` | Speed Demon | Complete a 10-question quiz in under 2 minutes | ⚡ | Complete 10-question quiz in < 120 seconds |
| `knowledge_seeker` | Knowledge Seeker | Complete quizzes in 10 different categories | 📚 | Play 10 unique categories |

### 💎 Platinum Tier (3)
| ID | Name | Description | Icon | Criteria |
|---|---|---|---|---|
| `century_club` | Century Club | Complete 100 quizzes | 💯 | Complete 100 total quizzes |
| `perfectionist` | Perfectionist | Achieve 3 perfect scores | ✨ | Score 100% on 3 different quizzes |
| `streak_legend` | Streak Legend | Maintain a 30-day streak | 👑 | Have current_streak >= 30 |

## Technical Implementation

### Database Function

The `check_and_award_achievements()` function:

```sql
create or replace function public.check_and_award_achievements(p_echo_user_id text)
returns void
language plpgsql
security definer
```

**What it does:**
1. Counts user's quiz statistics from `quiz_sessions` table
2. Checks current streak from `daily_streaks` table
3. Evaluates each achievement condition
4. Inserts records into `user_achievements` table
5. Uses `on conflict (user_id, achievement_id) do nothing` to prevent duplicates

### API Integration

From `src/app/api/quiz/submit/route.ts`:

```typescript
// After saving quiz session...

// Check and award achievements
const { error: achievementError } = await supabase.rpc(
  'check_and_award_achievements',
  { p_echo_user_id: echo_user_id }
)

// Fetch newly earned achievements
const { data: newAchievements } = await supabase
  .from('user_achievements')
  .select('*, achievement:achievements (*)')
  .eq('echo_user_id', echo_user_id)
  .gte('earned_at', new Date(Date.now() - 5000).toISOString())
```

### Client-Side Display

Achievements are fetched from:
- `/api/achievements` - All available achievements
- `/api/achievements/user?echo_user_id=xxx` - User's earned achievements

The UI shows:
- **Unlocked achievements**: Full color, with earned date
- **Locked achievements**: Grayscale, 50% opacity, with 🔒 badge

## Adding New Achievements

To add a new achievement:

1. **Add to database** (via SQL migration):
```sql
insert into public.achievements (id, name, description, icon, tier) values
  ('new_achievement_id', 'Achievement Name', 'Description', '🎉', 'gold');
```

2. **Add check logic** to `check_and_award_achievements()`:
```sql
-- Calculate criteria
select count(*) into v_some_count
from public.quiz_sessions
where echo_user_id = p_echo_user_id and [condition];

-- Award if criteria met
if v_some_count >= [threshold] then
  insert into public.user_achievements (user_id, echo_user_id, achievement_id)
  values (v_user_id, p_echo_user_id, 'new_achievement_id')
  on conflict (user_id, achievement_id) do nothing;
end if;
```

3. **Run migration** in Supabase SQL Editor

That's it! The achievement will automatically:
- ✅ Show in the dashboard/profile as locked
- ✅ Be awarded when users meet the criteria
- ✅ Appear in the achievements list

## Troubleshooting

**Achievement not awarded?**
1. Check the `quiz_sessions` table to verify the data exists
2. Manually call the function: `SELECT check_and_award_achievements('echo_user_id_here');`
3. Check `user_achievements` table for the record
4. Verify the criteria logic in the function

**Testing achievements:**
1. Complete quizzes that meet the criteria
2. Check the dashboard/profile page
3. Achievements appear immediately after quiz completion
4. Check browser console for any errors from `/api/quiz/submit`
