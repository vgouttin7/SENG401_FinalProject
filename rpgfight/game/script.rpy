# Persistent data
default persistent.high_score = 0

# Game state
default game_modifier_system = None
default current_stage = 1
default combat_stage = None
default game_score = 0


label start:

    # Initialize modifier system
    $ game_modifier_system = ModifierSystem()
    $ current_stage = 1
    $ game_score = 0

    jump stage_1


# ==================== STAGE 1 ====================
label stage_1:
    $ current_stage = 1

    call dialogue_stage_1

label stage_1_combat:

    $ combat_stage = CombatStage(STAGE_CONFIGS[1], game_modifier_system)

    window hide
    $ quick_menu = False
    play music zk_background_music
    call screen combat_screen

    $ quick_menu = True
    window auto

    if _return == "lose":
        jump stage_1_retry

    $ game_score += combat_stage.score

    "You survived the Elamite Period! Score: [combat_stage.score]"

    call run_quiz(1)

    jump stage_2


label stage_1_retry:
    $ game_score += combat_stage.score

    scene black
    with dissolve

    sim_ai "You have fallen. But history gives second chances to those who seek them."

    "Score so far: [game_score]"

    menu:
        "What would you like to do?"

        "Retry Stage 1":
            jump stage_1_combat

        "Restart from beginning":
            jump start

        "Quit":
            return


# ==================== STAGE 2 ====================
label stage_2:
    $ current_stage = 2

    call dialogue_stage_2

label stage_2_combat:

    $ combat_stage = CombatStage(STAGE_CONFIGS[2], game_modifier_system)

    window hide
    $ quick_menu = False
    play music zk_background_music
    call screen combat_screen

    $ quick_menu = True
    window auto

    if _return == "lose":
        jump stage_2_retry

    $ game_score += combat_stage.score

    "You conquered alongside Cyrus! Score: [combat_stage.score]"

    call run_quiz(2)

    jump stage_3


label stage_2_retry:
    $ game_score += combat_stage.score

    scene black
    with dissolve

    sim_ai "Cyrus faced defeat before his greatest victories. Will you rise again?"

    "Score so far: [game_score]"

    menu:
        "What would you like to do?"

        "Retry Stage 2":
            jump stage_2_combat

        "Restart from beginning":
            jump start

        "Quit":
            return


# ==================== STAGE 3 ====================
label stage_3:
    $ current_stage = 3

    call dialogue_stage_3

label stage_3_combat:

    $ combat_stage = CombatStage(STAGE_CONFIGS[3], game_modifier_system)

    window hide
    $ quick_menu = False
    play music zk_background_music
    call screen combat_screen

    $ quick_menu = True
    window auto

    if _return == "lose":
        jump stage_3_retry

    $ game_score += combat_stage.score

    "Babylon has fallen! Score: [combat_stage.score]"

    call run_quiz(3)

    jump stage_4


label stage_3_retry:
    $ game_score += combat_stage.score

    scene black
    with dissolve

    sim_ai "The walls of Babylon did not fall on the first attempt. Try again."

    "Score so far: [game_score]"

    menu:
        "What would you like to do?"

        "Retry Stage 3":
            jump stage_3_combat

        "Restart from beginning":
            jump start

        "Quit":
            return


# ==================== STAGE 4 ====================
label stage_4:
    $ current_stage = 4

    call dialogue_stage_4

label stage_4_combat:

    $ combat_stage = CombatStage(STAGE_CONFIGS[4], game_modifier_system)

    window hide
    $ quick_menu = False
    play music zk_background_music
    call screen combat_screen

    $ quick_menu = True
    window auto

    if _return == "lose":
        jump stage_4_retry

    $ game_score += combat_stage.score

    jump victory


label stage_4_retry:
    $ game_score += combat_stage.score

    scene black
    with dissolve

    sim_ai "Ahriman is relentless. But so is the spirit of justice. Rise again."

    "Score so far: [game_score]"

    menu:
        "What would you like to do?"

        "Retry Stage 4":
            jump stage_4_combat

        "Restart from beginning":
            jump start

        "Quit":
            return


# ==================== VICTORY ====================
label victory:

    if game_score >= persistent.high_score:
        $ persistent.high_score = game_score

    scene black
    with dissolve

    sim_ai "..."

    sim_ai "You have done it. You have understood what most of humanity refuses to learn."

    sim_ai "That power without justice is tyranny. That conquest without compassion is destruction."

    sim_ai "Cyrus showed the world a different path. Freedom over chains. Tolerance over forced conformity."

    sim_ai "The Cyrus Cylinder remains a testament - not just to one man, but to the possibility of human progress."

    sim_ai "You are free, traveler. Carry these lessons forward."

    "Congratulations! You completed Chronicles of Change: Persia!"

    "Final Score: [game_score]\nHigh Score: [persistent.high_score]"

    menu:
        "Play again?"

        "Yes":
            jump start

        "No":
            return
