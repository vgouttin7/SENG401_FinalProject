# Progress Tracker

## Phase 1: Foundation & Refactoring
- [x] 1.1 Refactor ZKDisplayable into GameManager state machine (script.rpy label flow)
- [x] 1.2 Extract Player class into separate file (player.rpy)
- [x] 1.3 Extract Enemy base class into separate file (enemies.rpy)
- [x] 1.4 Create CombatStage class (combat_stage.rpy)
- [x] 1.5 Create StageConfig data structure for multiple stages (stage_configs.rpy)
- [x] 1.6 Create multiple tile maps (one per stage, 4 maps in stage_configs.rpy)

## Phase 2: Dialogue System
- [x] 2.1 Build dialogue using Ren'Py native character/say system
- [x] 2.2 Create Character definitions (sim_ai, cyrus, priest, scholar, captive, narrator)
- [x] 2.3 Write dialogue scripts for Stage 1 (Early Persia)
- [x] 2.4 Write dialogue scripts for Stage 2 (Rise of Cyrus)
- [x] 2.5 Write dialogue scripts for Stage 3 (Fall of Babylon)
- [x] 2.6 Write dialogue scripts for Stage 4 (Cyrus Cylinder & Legacy)
- [x] 2.7 Integrate dialogue -> combat transition (in script.rpy flow)

## Phase 3: Quiz System
- [x] 3.1 Build quiz screens (quiz_screen, quiz_feedback, quiz_results)
- [x] 3.2 Create Question data structure
- [x] 3.3 Write question bank for all 4 stages (5 questions each)
- [x] 3.4 Implement answer evaluation and feedback display
- [x] 3.5 Integrate quiz -> reward transition

## Phase 4: Modifier / Power-Up System
- [x] 4.1 Build ModifierSystem class (modifier_system.rpy)
- [x] 4.2 Define modifier types (EXTRA_DASH, HEALTH_BOOST, SPEED_UP, DAMAGE_UP, SHIELD)
- [x] 4.3 Apply modifiers to Player before each combat stage
- [ ] 4.4 UI to show active modifiers during gameplay
- [x] 4.5 Integrate reward -> next stage transition

## Phase 5: Persian Enemy Types
- [x] 5.1 Create Enemy subclasses (ImmortalSoldier, WarElephant, DarkSorcerer)
- [x] 5.2 Implement unique behaviors per enemy type (speed variations)
- [ ] 5.3 Create Ahriman boss for Stage 4 (unique boss behavior)
- [x] 5.4 Wire enemy types into StageConfig
- [ ] 5.5 Replace placeholder zombie sprites with Persian art (when available)

## Phase 6: Polish & Integration
- [ ] 6.1 Full game flow test: Dialogue -> Combat -> Quiz -> Reward -> Next Stage
- [ ] 6.2 Score and progress persistence
- [ ] 6.3 Sound effects and music per era
- [ ] 6.4 Visual zone purification effect on stage completion
- [ ] 6.5 Game over and victory screens (done in script.rpy, needs art)
- [ ] 6.6 Backend API integration (if needed for course requirements)

## Current Status
- **Phase**: Phase 1-4 complete, Phase 5 partial
- **Blocking issues**: None - game should be runnable
- **Next action**: Test full game flow, then polish
