# The Wizard's Tower: Campaign Design Specification

## Executive Summary

A single-player campaign mode where players ascend an infinite tower by completing category-based trivia floors. Each floor is a 5-question quiz in a single category; players must score 3/5 or higher to advance. The tower cycles through all categories three times at escalating difficulties (Easy → Medium → Hard), yielding approximately 900-1000 floors.

---

## Core Loop

### Single Floor Mechanics

```
ENTER FLOOR N
    ↓
Determine category (from floor mapping)
Determine difficulty (Easy: 1-300, Medium: 301-600, Hard: 601-900)
    ↓
Generate 5 questions from category @ difficulty
    ↓
Player answers questions
    ↓
Score calculated (0-5 correct)
    ↓
IF score >= 3:
    → Advance to Floor N+1
    → Save progress to DB
    → Show success feedback + stats
ELSE:
    → Remain on Floor N
    → Show retry prompt + feedback
    → Can retry immediately
```

### Key Design Decisions

| Element | Decision | Rationale |
|---------|----------|-----------|
| Pass threshold | 3/5 (60%) | Challenging but not punishing |
| Retry penalty | None | Encourages persistence, not frustration |
| Question count | 5 per floor | Matches existing quiz formats |
| Lives system | None | Standalone campaign, not roguelike |
| Checkpoint | Every floor | Progress is permanent once achieved |

---

## Floor Structure & Mapping

### Three-Tier Difficulty Progression

The tower cycles through your entire category library three times:

| Tier | Floors | Difficulty | Lore Frame |
|------|--------|------------|------------|
| **The Lower Archives** | 1–300 | Easy | "Where seekers first learn to read the old texts" |
| **The Middle Stacks** | 301–600 | Medium | "Where the Drift begins to obscure the signal" |
| **The Upper Sanctum** | 601–900 | Hard | "Where only true maintainers can navigate" |

### Category Ordering

**Option A: Thematic Clusters** (Recommended)
Group categories into thematic "wings" of the tower for narrative coherence:

```
Floors 1-50:    The Hall of Arts (Literature, Music, Film, Theater, etc.)
Floors 51-100:  The Chamber of Sciences (Physics, Biology, Chemistry, etc.)
Floors 101-150: The Gallery of History (Ancient, Modern, Wars, Leaders, etc.)
Floors 151-200: The Court of Geography (Countries, Capitals, Landmarks, etc.)
Floors 201-250: The Arena of Sports (Teams, Players, Olympics, etc.)
Floors 251-300: The Vault of Pop Culture (TV, Games, Celebrities, Internet, etc.)
```

Then repeat for Medium and Hard tiers.

**Option B: Alphabetical**
Simple, predictable, easy to implement. Players know what's coming.

**Option C: Curated Difficulty Curve**
Within each tier, order categories from most accessible to most niche.

### Floor-to-Category Mapping Formula

```javascript
function getFloorData(floorNumber) {
  const categoriesPerTier = TOTAL_CATEGORIES; // e.g., 300
  
  // Determine tier and difficulty
  let tier, difficulty;
  if (floorNumber <= categoriesPerTier) {
    tier = 1;
    difficulty = 'easy';
  } else if (floorNumber <= categoriesPerTier * 2) {
    tier = 2;
    difficulty = 'medium';
  } else {
    tier = 3;
    difficulty = 'hard';
  }
  
  // Get category index (0-based)
  const categoryIndex = (floorNumber - 1) % categoriesPerTier;
  const category = ORDERED_CATEGORIES[categoryIndex];
  
  return { floorNumber, tier, difficulty, category };
}
```

---

## Progression & Persistence

### What Gets Saved

| Data Point | Type | Purpose |
|------------|------|---------|
| `current_floor` | integer | Player's highest reached floor |
| `floor_attempts` | jsonb | Attempt history per floor (scores, timestamps) |
| `total_questions_answered` | integer | Lifetime stat |
| `total_correct` | integer | Lifetime stat |
| `perfect_floors` | integer[] | Array of floor numbers with 5/5 scores |
| `category_stats` | jsonb | Per-category performance tracking |
| `achievements` | text[] | Array of unlocked achievement IDs |
| `session_stats` | jsonb | Current session tracking (for session-based achievements) |

### Database Schema Addition

```sql
-- Tower progress table
CREATE TABLE tower_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_floor INTEGER DEFAULT 1,
  highest_floor INTEGER DEFAULT 1,
  floor_attempts JSONB DEFAULT '{}',
  total_questions INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  perfect_floors INTEGER[] DEFAULT '{}',
  category_stats JSONB DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tower leaderboard view
CREATE VIEW tower_leaderboard AS
SELECT 
  u.id,
  u.username,
  u.avatar_url,
  tp.highest_floor,
  tp.total_correct,
  array_length(tp.perfect_floors, 1) as perfect_count,
  array_length(tp.achievements, 1) as achievement_count
FROM tower_progress tp
JOIN users u ON tp.user_id = u.id
ORDER BY tp.highest_floor DESC, tp.total_correct DESC;

-- Floor attempt logging
CREATE TABLE tower_floor_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  floor_number INTEGER NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL,
  questions JSONB NOT NULL,
  passed BOOLEAN NOT NULL,
  attempt_duration INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Achievement System

### The 25 Achievements

Organized by category with lore-appropriate naming:

#### Milestone Achievements (7)
*"Markers of your ascent through the Archive"*

| ID | Name | Condition | Lore Text |
|----|------|-----------|-----------|
| `first_steps` | First Steps | Complete Floor 1 | "Every maintainer begins with a single question." |
| `apprentice` | Apprentice Seeker | Reach Floor 25 | "The Wizard has noticed your arrival." |
| `scholar` | Scholar of the Archive | Reach Floor 100 | "You have learned to read the old texts." |
| `archivist` | Archivist | Reach Floor 300 | "The Lower Archives hold no more mysteries for you." |
| `signal_bearer` | Signal Bearer | Reach Floor 600 | "Through the Drift, your signal remains clear." |
| `tower_master` | Tower Master | Reach Floor 900 | "The Upper Sanctum opens its final doors." |
| `wizards_chosen` | The Wizard's Chosen | Complete all floors | "You have joined the Legion as a true Calibrator." |

#### Performance Achievements (6)
*"Proof of precision in the work"*

| ID | Name | Condition | Lore Text |
|----|------|-----------|-----------|
| `perfect_signal` | Perfect Signal | Score 5/5 on any floor | "No static. Pure clarity." |
| `clarity` | Clarity | Score 5/5 on 10 different floors | "Your signal cuts through the noise." |
| `precision` | Precision | Score 5/5 on 50 different floors | "The Wizard recognizes a fellow perfectionist." |
| `calibrator` | Calibrator | 5/5 on 5 consecutive floors | "Five floors. Five perfect readings. Zero drift." |
| `streak_keeper` | Streak Keeper | Pass 25 floors without failing | "Ignorance cannot catch what it cannot touch." |
| `unshakeable` | Unshakeable | Pass 50 floors without failing | "The fog rolls in. You walk through it." |

#### Category Mastery (5)
*"Deep knowledge in the specialized stacks"*

| ID | Name | Condition | Lore Text |
|----|------|-----------|-----------|
| `specialist` | Specialist | 5/5 on same category at all 3 difficulties | "One subject. Complete mastery." |
| `triple_crown` | Triple Crown | Achieve Specialist in 3 categories | "Three domains. Three perfect calibrations." |
| `polymath` | Polymath | 5/5 on 25 different categories | "The breadth of your knowledge impresses even the Wizard." |
| `renaissance` | Renaissance Mind | 5/5 on 50 different categories | "No corner of the Archive is foreign to you." |
| `universal` | Universal Maintainer | 5/5 on 100 different categories | "You see the patterns that connect all knowledge." |

#### Special Condition (5)
*"Achievements for the dedicated and the daring"*

| ID | Name | Condition | Lore Text |
|----|------|-----------|-----------|
| `night_owl` | Night Owl | Complete a floor between 12am-4am local | "The Tower never sleeps. Neither do you." |
| `marathon` | Marathon | Complete 50 floors in one session | "A single session. Fifty calibrations. The Wizard is impressed." |
| `sprint` | Sprint | Complete 10 floors in under 15 minutes | "Speed and accuracy are not opposites." |
| `persistence` | Persistence | Pass a floor after 5+ failed attempts | "Ignorance retreats from those who refuse to quit." |
| `clutch` | Clutch | Pass 10 floors with exactly 3/5 | "By the narrowest margin. Ten times. Still standing." |

#### Hidden Achievements (2)
*"Discovered by the truly devoted"*

| ID | Name | Condition | Lore Text |
|----|------|-----------|-----------|
| `pattern_seeker` | Pattern Seeker | Answer 1000 questions correctly | "One thousand correct answers. One thousand threads woven." |
| `fog_dispeller` | Fog Dispeller | Answer 5000 questions correctly | "Five thousand lights against the encroaching dark." |

### Achievement Unlock Flow

```javascript
async function checkAchievements(userId, floorResult, sessionStats) {
  const newAchievements = [];
  const progress = await getPlayerProgress(userId);
  
  // Check each achievement condition
  for (const achievement of ACHIEVEMENTS) {
    if (progress.achievements.includes(achievement.id)) continue;
    
    if (achievement.check(progress, floorResult, sessionStats)) {
      newAchievements.push(achievement);
      await unlockAchievement(userId, achievement.id);
    }
  }
  
  return newAchievements;
}
```

---

## UI/UX Flow

### Screen Architecture

```
[TOWER HOME]
    │
    ├── Current Floor Display (large, central)
    ├── Progress Bar (visual tier indicator)
    ├── "Approach the Tower" CTA
    ├── Recent Attempts Summary
    ├── Achievement Showcase (3-4 recent)
    └── Leaderboard Preview
          │
          ▼
[FLOOR SCREEN]
    │
    ├── Floor Number + Category Name
    ├── Difficulty Badge (Easy/Medium/Hard)
    ├── Tier Indicator (Lower Archives, etc.)
    ├── Question Display (1 of 5)
    ├── Answer Options (4 choices)
    └── Progress Dots (●●○○○)
          │
          ▼
[RESULTS SCREEN]
    │
    ├── Score Display (X/5)
    ├── Pass/Fail State
    │     ├── PASS: Celebration + "Advance" CTA
    │     └── FAIL: Encouragement + "Retry" CTA
    ├── Question Review (expandable)
    ├── New Achievements (if any)
    └── Stats Update
          │
          ▼
[ACHIEVEMENTS SCREEN] (accessible from Tower Home)
    │
    ├── Unlocked Achievements (with timestamps)
    ├── Locked Achievements (with progress hints)
    └── Total Count Display
          │
          ▼
[TOWER LEADERBOARD]
    │
    ├── Rank by Highest Floor
    ├── User Row Highlighting
    ├── Perfect Floor Count (secondary sort)
    └── Achievement Count Badge
```

### Visual Design Notes

**Tower Visualization**
- Consider a vertical tower graphic that fills as player progresses
- Three distinct visual zones for the three tiers
- Current position marker
- Fog/darkness above current floor (Ignorance waiting)

**Floor Transition**
- Ascending animation when passing
- Subtle "held back" animation when failing (no harsh punishment feel)
- Category icons/colors to differentiate subjects

**Achievement Unlocks**
- Toast notification during gameplay
- Full-screen celebration for major milestones (Floor 100, 300, 600, 900)
- Sound design cues (optional)

---

## Technical Implementation

### State Management

```typescript
interface TowerState {
  // Player progress
  currentFloor: number;
  highestFloor: number;
  achievements: string[];
  
  // Current floor attempt
  activeFloor: {
    number: number;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questions: Question[];
    answers: (number | null)[];
    currentQuestion: number;
    startTime: Date;
  } | null;
  
  // Session tracking
  session: {
    floorsCompleted: number;
    floorsWithoutFail: number;
    perfectFloors: number;
    startTime: Date;
  };
  
  // UI state
  isLoading: boolean;
  showResults: boolean;
  newAchievements: Achievement[];
}
```

### API Endpoints

```
GET  /api/tower/progress
     → Returns player's current tower state

POST /api/tower/start-floor
     → Generates questions for current floor
     → Body: { floorNumber: number }

POST /api/tower/submit-floor
     → Validates answers, updates progress
     → Body: { floorNumber, answers[], duration }
     → Returns: { score, passed, newFloor?, achievements[] }

GET  /api/tower/leaderboard
     → Returns tower leaderboard

GET  /api/tower/achievements
     → Returns all achievements with unlock status
```

### Question Generation

Uses existing quiz generation infrastructure:

```javascript
async function generateFloorQuestions(floor) {
  const { category, difficulty } = getFloorData(floor);
  
  return await generateQuiz({
    category,
    difficulty,
    count: 5,
    // Use same auth/generation as other modes
  });
}
```

---

## Leaderboard Design

### Primary Leaderboard View

| Rank | Player | Floor | Perfect Floors | Achievements |
|------|--------|-------|----------------|--------------|
| 1 | @wizardmaster | 847 | 312 | 23/25 |
| 2 | @signalkeeper | 756 | 298 | 21/25 |
| 3 | @archivistpro | 699 | 245 | 19/25 |

### Sorting Logic

1. **Primary**: Highest floor reached
2. **Secondary**: Total perfect floors (5/5 scores)
3. **Tertiary**: Total questions answered correctly

### Filters/Views

- All-time rankings
- Weekly/Monthly climbers
- Friends only (if social features exist)
- By tier (who's highest in Easy, Medium, Hard)

---

## Edge Cases & Rules

### Retry Logic
- No cooldown between retries
- Same category, same difficulty
- New questions generated each attempt (prevents memorization gaming)

### Session Definition
- Session = continuous play without 30+ minute gap
- Used for session-based achievements (Marathon, Sprint)

### Time Zone Handling
- Night Owl achievement uses player's local time
- Stored in UTC, converted on frontend

### Progress Recovery
- If player abandons a floor mid-attempt, no penalty
- Resume brings them back to floor start (fresh questions)

---

## Launch Checklist

### Phase 1: Core Loop
- [ ] Floor generation and mapping
- [ ] Question fetching per floor
- [ ] Pass/fail logic (3/5 threshold)
- [ ] Progress persistence
- [ ] Basic UI flow

### Phase 2: Progression
- [ ] Full category ordering
- [ ] Three-tier difficulty scaling
- [ ] Floor-to-category mapping
- [ ] Tier transition visuals

### Phase 3: Achievements
- [ ] Achievement definitions in DB
- [ ] Unlock checking logic
- [ ] Achievement UI (list + toasts)
- [ ] Hidden achievement reveals

### Phase 4: Leaderboard
- [ ] Leaderboard view/API
- [ ] Ranking calculation
- [ ] Real-time updates

### Phase 5: Polish
- [ ] Animations and transitions
- [ ] Sound design
- [ ] Lore integration throughout
- [ ] Mobile responsiveness

---

## Open Questions

1. **Category Count**: Exactly how many categories are in the current DB? (Need for precise floor mapping)

2. **Freeplay Overlap**: Should Tower floors use the same question pool as Freeplay, or separate?

3. **Daily Integration**: Any connection to Daily Challenge? (e.g., bonus XP for Tower if you've done Daily)

4. **Retry Questions**: Generate fresh questions on retry, or show same set? (Recommend: fresh)

5. **Partial Progress**: If player answers 3/5 then leaves, do they restart the floor entirely?

---

*Document Version: 1.0*  
*Last Updated: December 2024*  
*For: Trivia Wizard Tower Campaign*
