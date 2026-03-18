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

# Stage-specific background music mapping
default _stage_music = {
    1: "audio/story1_background_music.mp3",
    2: "audio/story2_background_music.mp3",
    3: "audio/story3_background_music.mp3",
    4: "audio/story4_background_music.mp3",
}

# Stage-specific combat music mapping
default _combat_music = {
    1: "audio/zk_background_music.wav",
    2: "audio/zk_background_music.wav",
    3: "audio/zk_background_music.wav",
    4: "audio/zk_background_music.wav",
}

# Stage-specific quiz music mapping
default _quiz_music = {
    1: "audio/kahoot_quiz_music.mp3",
    2: "audio/kahoot_quiz_music.mp3",
    3: "audio/kahoot_quiz_music.mp3",
    4: "audio/kahoot_quiz_music.mp3",
}

# Stage-specific retry messages
default _stage_retry_messages = {
    1: "You have fallen. But history gives second chances to those who seek them.",
    2: "Cyrus faced defeat before his greatest victories. Will you rise again?",
    3: "The walls of Babylon did not fall on the first attempt. Try again.",
    4: "Ahriman is relentless, but so is the spirit of justice. Rise again.",
}

# Stage-specific completion messages
default _stage_complete_messages = {
    1: "You survived the Elamite Period!",
    2: "You conquered alongside Cyrus!",
    3: "Babylon has fallen!",
    4: "You have defeated the forces of darkness!",
}


label start:

    # Initialize modifier system
    $ game_modifier_system = ModifierSystem()
    $ current_stage = 1
    $ game_score = 0

    # Try to load config from dashboard API
    $ _game_config = load_game_config()

    if _game_config is not None:
        # Config loaded from API/cache — build dynamic data
        $ _dynamic_stages = build_stage_configs_from_json(_game_config)
        $ _dynamic_questions = build_questions_from_json(_game_config)
        $ _dynamic_dialogue = build_dialogue_from_json(_game_config)
        $ _dynamic_music = build_stage_music_from_json(_game_config)
        $ _player_config = build_player_config_from_json(_game_config)
        $ _total_stages = len(_dynamic_stages)

        # Override the global STAGE_CONFIGS, STAGE_QUESTIONS, and stage music
        $ STAGE_CONFIGS.update(_dynamic_stages)
        $ STAGE_QUESTIONS.update(_dynamic_questions)
        $ _stage_music.update(_dynamic_music)
        $ _dynamic_combat_music = build_combat_music_from_json(_game_config)
        $ _combat_music.update(_dynamic_combat_music)
        $ _dynamic_quiz_music = build_quiz_music_from_json(_game_config)
        $ _quiz_music.update(_dynamic_quiz_music)

        $ print("[GAME] Dynamic config applied: %d stages, %d question sets, %d dialogue sets" % (len(_dynamic_stages), len(_dynamic_questions), len(_dynamic_dialogue)))
    else:
        $ print("[GAME] No dynamic config — using hardcoded defaults")

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
    if current_stage in _combat_music:
        play music _combat_music[current_stage] volume 0.3
    else:
        play music "audio/zk_background_music.wav" volume 0.3
    call screen combat_screen

    $ quick_menu = True
    window auto

    if _return == "lose":
        jump run_stage_retry

    $ game_score += combat_stage.score

    if current_stage in _stage_complete_messages:
        "[_stage_complete_messages[current_stage]] Score: [combat_stage.score]"
    else:
        "[STAGE_CONFIGS[current_stage].era_name] complete! Score: [combat_stage.score]"

    call run_quiz(current_stage)

    $ current_stage += 1

    jump run_stage


label run_stage_retry:
    $ game_score += combat_stage.score

    scene black
    with dissolve

    if current_stage == 4:
        stop music
        play sound "audio/death_music.mp3"

    if current_stage in _stage_retry_messages:
        show sim_ai neutral
        sim_ai "[_stage_retry_messages[current_stage]]"
    else:
        "You have fallen. But history gives second chances to those who seek them."

    scene black

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

    # Play stage-specific background music during dialogue
    if stage_num in _stage_music:
        play music _stage_music[stage_num] volume 0.3

    # If we have dynamic dialogue from the API, play it with portrait support
    if _dynamic_dialogue is not None and stage_num in _dynamic_dialogue:
        scene bg gray
        with dissolve

        python:
            _dialogue_lines = list(_dynamic_dialogue[stage_num])
            _current_dyn_speaker = ""

        while len(_dialogue_lines) > 0:
            python:
                _dl = _dialogue_lines.pop(0)
                _speaker_name = _dl["speaker"]
                _speaker_color = _dl["color"]
                _portrait_path = _dl.get("portrait", "")
                _line_text = _dl["text"]
                _speaker_changed = (_speaker_name != _current_dyn_speaker)
                _current_dyn_speaker = _speaker_name
                _dyn_char = Character(_speaker_name, color=_speaker_color, what_color="#DDDDDD")

            # When speaker changes, clear and re-show background
            if _speaker_changed:
                scene bg gray

            # Show character portrait if specified
            if _portrait_path:
                show expression _portrait_path as dyn_portrait

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

    scene bg gray
    with dissolve

    stop music
    play music "audio/victory_background_music.mp3"  volume 0.5

    show sim_ai neutral
    sim_ai "Well done, traveler. You have navigated the trials of history and emerged victorious."
    sim_ai "You have understood what most of humanity refuses to learn."

    show sim_ai angry
    sim_ai "That power without justice is tyranny. That conquest without compassion is destruction."

    show sim_ai neutral
    sim_ai "Cyrus showed the world a different path. Freedom over chains. Tolerance over forced conformity."
    sim_ai "The Cyrus Cylinder remains a testament - not just to one man, but to the possibility of human progress."
    sim_ai "You are free, traveler. Carry these lessons forward."

    stop music

    scene black

    play sound "audio/victory_sound.mp3"

    "Congratulations! You completed Chronicles of Change: Persia!"

    "Final Score: [game_score]\nHigh Score: [persistent.high_score]"

    stop sound fadeout 1.0

    play sound "audio/last_menu_background_music.mp3"  volume 0.5

    menu:
        "Play again?"

        "Yes":
            jump start

        "No":
            return
