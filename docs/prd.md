
מעולה. עכשיו אנחנו בונים משהו רציני 😎
אני כותבת לכם PRD מלא ומסודר, כמו שצריך, אבל מותאם לילדים בני 10 ולסביבה בית־ספרית בישראל.

---

````md
# Jerusalem Quest – Gamified Learning App
## Product Requirements Document (PRD)
**Target Age:** 9–10 years old  
**Language:** Hebrew  
**Platform:** Web (Mobile-first)  
**Environment:** Classroom usage  
**Core Feature:** Riddle-based learning + Full Leaderboard + Badge System  

---

# 1. Product Vision

Create an interactive educational game about Jerusalem that:
- Teaches one selected topic through short riddles
- Encourages engagement through points and badges
- Displays a full leaderboard of all participants
- Highlights the Top 5 players visually using colors
- Maintains a positive and safe environment for children

The system must balance:
Fun + Competition + Confidence + Simplicity

---

# 2. Educational Goals

- Reinforce knowledge about Jerusalem
- Improve reading comprehension
- Encourage participation
- Create healthy classroom competition
- Reward effort, not only ranking

---

# 3. User Flow

## 3.1 Start Screen

Fields:
- Title of the game
- Short instruction (1 sentence max)
- Name input field (max 15 characters)
- "Start Game" button

Validations:
- No empty name
- No special characters
- Basic profanity filter
- No duplicate exact names (append number automatically if needed)

Example:
If "Noa" already exists → second "Noa" becomes "Noa2"

---

## 3.2 Game Screen

Components:
- Riddle text (max 2 lines)
- 3 answer buttons
- Progress bar (e.g. 3/6)
- Score counter (top corner)
- Optional timer (count up)

Scoring Rules:
- Correct answer = 10 points
- Speed bonus (optional) = +5 points
- Wrong answer = 0 points (no negative scoring)

After answer:
- Correct → short explanation + small visual feedback
- Wrong → hint displayed

---

## 3.3 End Screen

Displays:
- Total score
- Total correct answers
- Earned badges
- Button: "View Leaderboard"

---

# 4. Leaderboard System

## 4.1 Display Rules

The leaderboard must:
- Show ALL users
- Sort by score descending
- In case of tie → shorter time wins
- Display ranking number

Columns:
1. Rank #
2. Player Name
3. Score
4. Badges icons

---

## 4.2 Top 5 Highlighting

Top 5 players must be visually distinct:

Rank 1 → Gold background  
Rank 2 → Silver background  
Rank 3 → Bronze background  
Rank 4 → Blue highlight  
Rank 5 → Green highlight  

Ranks 6+ → Neutral background

No flashing animations (avoid overstimulation).

---

## 4.3 Badge System

Badges are awarded independently of ranking.

### Badge Types

🏅 "Jerusalem Expert"
- All answers correct

⚡ "Fast Thinker"
- Completed under defined time

📚 "History Star"
- Correct answers on historical questions

🧠 "Smart Explorer"
- 5 correct answers

⭐ "Participation Hero"
- Finished the game

Each badge:
- Icon
- Tooltip description
- Stored in database

Badges appear:
- On end screen
- On leaderboard next to player name

---

# 5. Data Model

## 5.1 Player Entity

```json
{
  "id": "uuid",
  "name": "string",
  "score": 60,
  "correctAnswers": 6,
  "timeSeconds": 85,
  "badges": ["Jerusalem Expert", "Fast Thinker"],
  "createdAt": "timestamp"
}
````

---

# 6. Safety & Classroom Controls

* Teacher reset leaderboard button
* Daily reset option
* Disable name editing after submission
* No chat functionality
* No player-to-player interaction

Optional:
Teacher mode with password to:

* Delete inappropriate names
* Remove specific player
* Export results

---

# 7. Non-Functional Requirements

## Performance

* Must load under 2 seconds
* Handle at least 40 concurrent players

## Accessibility

* Large buttons
* Clear fonts
* High contrast colors
* Mobile + tablet compatible

## Language

* Full Hebrew RTL support
* No long paragraphs
* Simple vocabulary

---

# 8. UI/UX Guidelines

* Bright but not aggressive colors
* Rounded buttons
* Visual feedback on click
* Large readable text
* Minimal scrolling
* Clean layout

Leaderboard:

* Table centered
* Top 5 with colored rows
* Badge icons small but visible

---

# 9. Technical Architecture (MVP)

Frontend:

* React / Next.js

Backend:

* Firebase / Supabase

Storage:

* Cloud Firestore

Optional:

* LocalStorage fallback if offline

---

# 10. Analytics (Optional)

Track:

* Most missed question
* Average completion time
* Number of participants
* Distribution of badges

Purpose:
Improve question quality.

---

# 11. Future Enhancements

* Multi-class competition
* Weekly championship
* Avatar selection
* Sound effects toggle
* Certificate PDF generation

---

# 12. Risks & Mitigation

Risk:
Children discouraged by low rank

Mitigation:

* Strong badge emphasis
* Positive end-screen message
* No negative scoring

Risk:
Inappropriate names

Mitigation:

* Validation + teacher control

---

# 13. Success Metrics

* 90% completion rate
* At least 70% of students earn 2+ badges
* Positive teacher feedback
* Increased classroom engagement

---

# 14. Final Experience Goal

When a child finishes the game, they should feel:

"I learned something."
"I had fun."
"I want to play again."

```

---

אם תרצה, אני יכולה עכשיו:

- לבנות לך גם ERD  
- לכתוב user stories  
- להכין architecture diagram  
- או לתת לך בסיס קוד ראשוני  

רוצה שנמשיך לרמת SaaS קטנה לבית ספר? 😏
```
