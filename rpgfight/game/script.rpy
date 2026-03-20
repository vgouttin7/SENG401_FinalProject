# Persistent data
default persistent.high_score = 0

# Game state
default game_modifier_system = None
default current_stage = 1
default combat_stage = None
default game_score = 0

# Config state - loaded from API/cache
default _game_config = None
default _dynamic_stages = None
default _dynamic_questions = None
default _dynamic_dialogue = None
default _total_stages = 0
default _selected_campaign_id = None
default _available_campaigns = None

# Dynamic character for dialogue (when loaded from DB)
default _dyn_char = None

# Victory dialogue from dashboard
default _victory_dialogue = None
default _victory_music = ""

# All loaded from dashboard DB — empty until config is fetched
default _stage_music = {}
default _combat_music = {}
default _quiz_music = {}
default _stage_retry_messages = {}
default _stage_complete_messages = {}


label start:

    # Initialize modifier system
    $ game_modifier_system = ModifierSystem()
    $ current_stage = 1
    $ game_score = 0

    # Fetch available campaigns and let the player choose
    $ _available_campaigns = load_campaigns_list()

    if _available_campaigns is not None and len(_available_campaigns) > 1:
        # Multiple campaigns available — show selection screen
        call screen campaign_select(_available_campaigns)
        $ _selected_campaign_id = _return
        $ _game_config = load_game_config(campaign_id=_selected_campaign_id)
    elif _available_campaigns is not None and len(_available_campaigns) == 1:
        # Only one campaign — load it directly by ID
        $ _selected_campaign_id = _available_campaigns[0]["id"]
        $ _game_config = load_game_config(campaign_id=_selected_campaign_id)
    else:
        # No campaign list available — fall back to default behavior
        $ _game_config = load_game_config()

    if _game_config is None:
        scene black
        "Could not load game configuration."
        "Please ensure the dashboard is running and try again."
        return

    # Build all game data from dashboard config
    $ _dynamic_stages = build_stage_configs_from_json(_game_config)
    $ _dynamic_questions = build_questions_from_json(_game_config)
    $ _dynamic_dialogue = build_dialogue_from_json(_game_config)
    $ _player_config = build_player_config_from_json(_game_config)
    $ _total_stages = len(_dynamic_stages)

    $ STAGE_CONFIGS.update(_dynamic_stages)
    $ STAGE_QUESTIONS.update(_dynamic_questions)
    $ _stage_music.update(build_stage_music_from_json(_game_config))
    $ _combat_music.update(build_combat_music_from_json(_game_config))
    $ _quiz_music.update(build_quiz_music_from_json(_game_config))

    python:
        _dyn_complete, _dyn_retry = build_stage_messages_from_json(_game_config)
        _stage_complete_messages.update(_dyn_complete)
        _stage_retry_messages.update(_dyn_retry)
        _victory_music, _victory_dialogue = build_victory_dialogue_from_json(_game_config)

    $ print("[GAME] Config loaded: %d stages, %d question sets, %d dialogue sets" % (len(_dynamic_stages), len(_dynamic_questions), len(_dynamic_dialogue)))

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
    call screen combat_screen

    $ quick_menu = True
    window auto

    if _return == "lose":
        jump run_stage_retry

    $ game_score += combat_stage.score

    if current_stage in _stage_complete_messages:
        "[_stage_complete_messages[current_stage]] Score: [combat_stage.score]"
    else:
        "Stage complete! Score: [combat_stage.score]"

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
        "[_stage_retry_messages[current_stage]]"
    else:
        "You have fallen. Try again."

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

            if _speaker_changed:
                scene bg gray

            if _portrait_path:
                show expression _portrait_path as dyn_portrait

            $ _dyn_char(_line_text)

    return


# ==================== VICTORY ====================
label victory:

    if game_score >= persistent.high_score:
        $ persistent.high_score = game_score

    scene bg gray
    with dissolve

    stop music

    if _victory_music:
        play music _victory_music volume 0.5

    # Victory dialogue from dashboard
    if _victory_dialogue is not None and len(_victory_dialogue) > 0:
        python:
            _vd_lines = list(_victory_dialogue)
            _vd_current_speaker = ""

        while len(_vd_lines) > 0:
            python:
                _vl = _vd_lines.pop(0)
                _vl_speaker = _vl["speaker"]
                _vl_color = _vl["color"]
                _vl_portrait = _vl.get("portrait", "")
                _vl_text = _vl["text"]
                _vl_speaker_changed = (_vl_speaker != _vd_current_speaker)
                _vd_current_speaker = _vl_speaker
                _vl_char = Character(_vl_speaker, color=_vl_color, what_color="#DDDDDD")

            if _vl_speaker_changed:
                scene bg gray

            if _vl_portrait:
                show expression _vl_portrait as vict_portrait

            $ _vl_char(_vl_text)

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
