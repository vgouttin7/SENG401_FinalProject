# Persistent data
default persistent.high_score = 0

# Game state
default game_modifier_system = None
default current_stage = 1
default combat_stage = None
default game_score = 0

# Config state - loaded from API/cache or None for fallback
default _game_config = None
default _dynamic_stages = None
default _dynamic_questions = None
default _dynamic_dialogue = None
default _total_stages = 4

# Dynamic character for dialogue (when loaded from DB)
default _dyn_char = None


label start:

    # Initialize modifier system
    $ game_modifier_system = ModifierSystem()
    $ current_stage = 1
    $ game_score = 0

    # Try to load config from dashboard API
    $ _game_config = load_game_config(1)

    if _game_config is not None:
        # Config loaded from API/cache — build dynamic data
        $ _dynamic_stages = build_stage_configs_from_json(_game_config)
        $ _dynamic_questions = build_questions_from_json(_game_config)
        $ _dynamic_dialogue = build_dialogue_from_json(_game_config)
        $ _player_config = build_player_config_from_json(_game_config)
        $ _total_stages = len(_dynamic_stages)

        # Override the global STAGE_CONFIGS and STAGE_QUESTIONS
        $ STAGE_CONFIGS.update(_dynamic_stages)
        $ STAGE_QUESTIONS.update(_dynamic_questions)

    jump run_stage


# ==================== DYNAMIC STAGE LOOP ====================

label run_stage:

    if current_stage > _total_stages:
        jump victory

    # Play dialogue
    call play_dialogue(current_stage)

label run_stage_combat:

    $ combat_stage = CombatStage(STAGE_CONFIGS[current_stage], game_modifier_system)

    window hide
    $ quick_menu = False
    play music zk_background_music
    call screen combat_screen

    $ quick_menu = True
    window auto

    if _return == "lose":
        jump run_stage_retry

    $ game_score += combat_stage.score

    "[STAGE_CONFIGS[current_stage].era_name] complete! Score: [combat_stage.score]"

    call run_quiz(current_stage)

    $ current_stage += 1

    jump run_stage


label run_stage_retry:
    $ game_score += combat_stage.score

    scene black
    with dissolve

    "You have fallen. But history gives second chances to those who seek them."

    "Score so far: [game_score]"

    menu:
        "What would you like to do?"

        "Retry this stage":
            jump run_stage_combat

        "Restart from beginning":
            jump start

        "Quit":
            return


# ==================== DYNAMIC DIALOGUE ====================

label play_dialogue(stage_num):

    # If we have dynamic dialogue from the API, play it
    if _dynamic_dialogue is not None and stage_num in _dynamic_dialogue:
        scene black
        with dissolve

        python:
            _dialogue_lines = _dynamic_dialogue[stage_num]

        while len(_dialogue_lines) > 0:
            python:
                _dl = _dialogue_lines.pop(0)
                _speaker_name = _dl["speaker"]
                _speaker_color = _dl["color"]
                _line_text = _dl["text"]
                # Create a dynamic Ren'Py character
                _dyn_char = Character(_speaker_name, color=_speaker_color, what_color="#DDDDDD")

            $ _dyn_char(_line_text)

        return

    # Fallback: use hardcoded dialogue labels
    if stage_num == 1:
        call dialogue_stage_1
    elif stage_num == 2:
        call dialogue_stage_2
    elif stage_num == 3:
        call dialogue_stage_3
    elif stage_num == 4:
        call dialogue_stage_4

    return


# ==================== VICTORY ====================
label victory:

    if game_score >= persistent.high_score:
        $ persistent.high_score = game_score

    scene black
    with dissolve

    "Congratulations! You completed the campaign!"

    "Final Score: [game_score]\nHigh Score: [persistent.high_score]"

    menu:
        "Play again?"

        "Yes":
            jump start

        "No":
            return
