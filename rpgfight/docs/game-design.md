# Game Design Document - Chronicles of Change: Persia

## Core Game Loop

```
[DIALOGUE] --> [COMBAT STAGE] --> [QUIZ] --> [REWARD] --> [NEXT STAGE]
   |                |                |           |
   |  Historical    | Platformer     | Questions  | Modifiers
   |  figures talk  | survive timer  | about what | (dash, health,
   |  teach history | fight enemies  | you learned| speed, etc.)
   |                |                |            |
   v                v                v            v
  Learn            Play             Prove        Power Up
```

## Game Flow by Stage

### Stage 1: Early Persia / Elamite Period (~3200-550 BC)
- **Dialogue**: Introduction to the Iranian plateau, Elamite civilization, early Median kingdom
- **Combat**: Easy enemies, basic platforms, long timer
- **Quiz**: Basic geography and early civilization questions
- **Reward**: Minor modifier

### Stage 2: Rise of Cyrus the Great (~559-540 BC)
- **Dialogue**: Cyrus unites Persians and Medes, conquers Lydia
- **Combat**: Medium difficulty, more enemies, shorter timer
- **Quiz**: Questions about Cyrus's early conquests and strategy
- **Reward**: Medium modifier

### Stage 3: Fall of Babylon (539 BC)
- **Dialogue**: Cyrus conquers Babylon, frees the Israelites
- **Combat**: Hard enemies, complex platforms, short timer
- **Quiz**: Questions about Babylonian captivity, liberation, tolerance
- **Reward**: Strong modifier

### Stage 4: The Cyrus Cylinder & Legacy
- **Dialogue**: Cyrus Cylinder, human rights declaration, governing philosophy
- **Combat**: Boss-level (Ahriman - spirit of chaos and oppression)
- **Quiz**: Final exam on all Persian history
- **Reward**: Victory / game completion

## Class Architecture

### GameManager (State Machine - Orchestrator)
- Manages game state transitions: DIALOGUE -> COMBAT -> QUIZ -> REWARD
- Holds references to all subsystems
- Tracks current stage number and progression
- Replaces ZKDisplayable as the main controller

### DialogueSystem
- Displays character portraits + text boxes
- Advances through dialogue scripts per stage
- Supports multiple speakers (historical figures)
- Uses Ren'Py's built-in dialogue/say system where possible

### Character
- name: str (e.g., "Cyrus the Great", "Zoroastrian Priest")
- portrait: image reference
- role: str (narrator, teacher, antagonist)

### DialogueScript
- stage_id: int
- lines: list of (Character, text) pairs
- on_complete: callback to transition to combat

### CombatStage (Refactored from ZKDisplayable)
- Runs the platformer gameplay
- Loads tile map from stage config
- Spawns enemies based on stage difficulty
- Timer countdown
- Receives active modifiers from ModifierSystem

### Player (Refactored from ZKPlayer)
- All existing movement/physics/animation
- modifier_slots: list of active Modifier objects
- base_health: int (default 100)
- effective_health: base_health + modifier bonuses
- dash_count: int (base 1, increased by modifiers)
- speed_multiplier: float (base 1.0)

### Enemy (Base Class - Refactored from ZKZombie)
- Base enemy with walk/die/rise animations
- Subclasses for Persian-themed enemies:
  - **ImmortalSoldier**: Basic foot soldier (Stage 1-2)
  - **WarElephant**: Slow but high damage (Stage 2-3)
  - **DarkSorcerer**: Ranged attacks (Stage 3-4)
  - **Ahriman**: Final boss (Stage 4)
- Placeholder: zombie sprites until Persian art is ready

### QuizSystem
- Presents multiple-choice questions after combat
- Questions tagged by stage
- Tracks correct/incorrect answers
- Returns QuizResult with score and unlocked modifiers

### Question
- text: str
- choices: list of str (4 options)
- correct_index: int
- era_tag: str
- explanation: str (shown after answering - educational feedback)

### Modifier
- type: enum (EXTRA_DASH, HEALTH_BOOST, SPEED_UP, DAMAGE_UP, SHIELD)
- value: float (magnitude of the buff)
- name: str (display name)
- description: str

### ModifierSystem
- active_modifiers: list of Modifier
- apply_to_player(player): applies all active modifiers
- add_modifier(modifier): earned from quiz success

### StageConfig
- stage_id: int
- era_name: str
- tile_map: 2D array (platform layout)
- enemy_types: list of enemy classes to spawn
- enemy_speed_range: (min, max)
- spawn_interval: int (seconds)
- round_time: int (seconds)
- dialogue_script: DialogueScript
- questions: list of Question

### TileMap
- Loaded from StageConfig
- Multiple platform layouts (one per stage)
- Same tile rendering system as current code

## File Structure (Target)

```
game/
├── script.rpy              # Entry point, launches GameManager
├── game_manager.rpy        # GameManager state machine
├── dialogue_system.rpy     # Dialogue display and progression
├── combat_stage.rpy        # Platformer gameplay (refactored zombieknight)
├── quiz_system.rpy         # Quiz UI and logic
├── modifier_system.rpy     # Power-up/buff management
├── player.rpy              # Player class
├── enemies.rpy             # Enemy base class + subclasses
├── stage_configs.rpy       # Stage data (maps, enemy configs)
├── dialogue_scripts.rpy    # All dialogue content per stage
├── questions.rpy           # Question bank per stage
├── screens.rpy             # UI screens
├── gui.rpy                 # GUI config
├── options.rpy             # Game options
├── audio/                  # Sound effects & music
└── images/                 # All sprites and art
    ├── player/
    ├── enemies/            # Persian enemy sprites (placeholder: zombie/)
    ├── tiles/
    ├── portals/
    ├── characters/         # Dialogue character portraits
    └── ui/                 # Quiz and modifier UI elements
```

## Modifier Rewards by Quiz Performance

| Correct Answers | Modifier Earned |
|----------------|-----------------|
| 5/5 (perfect)  | Major buff (e.g., +50 health, double dash) |
| 4/5            | Good buff (e.g., +30 health, speed up) |
| 3/5            | Minor buff (e.g., +10 health) |
| 2/5 or less    | No modifier, proceed with base stats |

## Enemy Difficulty Scaling

| Stage | Enemy Types | Speed Range | Spawn Interval | Timer |
|-------|------------|-------------|----------------|-------|
| 1     | ImmortalSoldier | 1-3 | 6s | 45s |
| 2     | ImmortalSoldier, WarElephant | 2-5 | 5s | 40s |
| 3     | ImmortalSoldier, DarkSorcerer | 3-6 | 4s | 35s |
| 4     | All + Ahriman (boss) | 4-8 | 3s | 60s |
