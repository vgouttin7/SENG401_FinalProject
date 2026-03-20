init -2 python:

    def build_modifier_pool(cs):
        """
        Build a list of modifier options ranked by playstyle.
        cs = combat_stage instance with playstyle stats.
        Aggressive players (high kills, beams) see damage/dash first.
        Defensive players (high damage taken) see health/shield first.
        Balanced players see speed/utility first.
        """

        # All possible modifiers with thematic names
        all_mods = [
            Modifier(Modifier.HEALTH_BOOST, 30, "Immortal's Resolve", "+30 max health"),
            Modifier(Modifier.SPEED_UP, 0.25, "Wind of Zagros", "Move 25%% faster"),
            Modifier(Modifier.EXTRA_DASH, 1, "Dual Blades", "+1 extra slash per attack"),
            Modifier(Modifier.DAMAGE_UP, 0.5, "Wrath of Persepolis", "Take less damage"),
            Modifier(Modifier.SHIELD, 1, "Ahura Mazda's Grace", "Survive one fatal blow"),
        ]

        kills = cs.enemies_killed
        dmg = cs.damage_taken
        beams = cs.beams_fired

        # Score each modifier type by playstyle relevance
        scores = {}
        for mod in all_mods:
            score = 0
            if mod.mod_type == Modifier.DAMAGE_UP:
                score = kills * 3 + beams * 2
            elif mod.mod_type == Modifier.EXTRA_DASH:
                score = beams * 3 + kills * 2
            elif mod.mod_type == Modifier.HEALTH_BOOST:
                score = dmg * 3
            elif mod.mod_type == Modifier.SHIELD:
                score = dmg * 4 + 5
            elif mod.mod_type == Modifier.SPEED_UP:
                score = kills + beams
            # Add some randomness so it's not always the same
            score += random.randint(0, 5)
            scores[mod.mod_type] = (score, mod)

        # Sort by score descending, return modifiers
        ranked = sorted(scores.values(), key=lambda x: x[0], reverse=True)
        return [item[1] for item in ranked]


    def build_penalty_pool():
        """Build a list of penalty modifiers for wrong quiz answers."""
        all_penalties = [
            Modifier(Modifier.HEALTH_BOOST, -20, "Ahriman's Curse", "-20 max health"),
            Modifier(Modifier.SPEED_UP, -0.15, "Chains of Babylon", "Move 15%% slower"),
            Modifier(Modifier.DAMAGE_UP, -0.25, "Shadow of Ahriman", "Take more damage"),
        ]
        random.shuffle(all_penalties)
        return all_penalties


    class Question():
        def __init__(self, text, choices, correct_index, explanation):
            self.text = text
            self.choices = choices
            self.correct_index = correct_index
            self.explanation = explanation

    # Question bank — loaded from dashboard DB
    STAGE_QUESTIONS = {}


# Quiz screen
screen quiz_screen(questions, stage_num):
    modal True

    add Solid("#1a0a2e")

    vbox:
        xalign 0.5
        yalign 0.1
        text "Knowledge Check - Stage [stage_num]" size 50 color "#FFD700" xalign 0.5 outlines [(3, "#8B6914", 0, 0)] font "gui/font/Poultrygeist.ttf"
        text "Answer questions about what you learned" size 30 color "#CCCCCC" xalign 0.5

    vbox:
        xalign 0.5
        yalign 0.45
        xsize 1400
        spacing 20

        text quiz_current_question.text size 36 color "#FFFFFF" xalign 0.5 text_align 0.5

        null height 30

        for i, choice in enumerate(quiz_current_question.choices):
            textbutton choice:
                xalign 0.5
                xsize 1200
                text_size 30
                text_color "#FFFFFF"
                text_hover_color "#FFD700"
                background Frame(Solid("#2a1a4e"), 10, 10)
                hover_background Frame(Solid("#3a2a6e"), 10, 10)
                padding (30, 15, 30, 15)
                action Return(i)

    vbox:
        xalign 0.5
        yalign 0.9
        text "Question [quiz_question_index + 1] of [len(questions)]" size 24 color "#888888" xalign 0.5
        text "Correct: [quiz_correct_count] / [quiz_question_index]" size 24 color "#888888" xalign 0.5


screen quiz_feedback(is_correct, explanation):
    modal True

    add Solid("#1a0a2e")

    vbox:
        xalign 0.5
        yalign 0.4
        xsize 1400
        spacing 30

        if is_correct:
            text "Correct!" size 60 color "#00FF00" xalign 0.5 outlines [(3, "#007300", 0, 0)]
        else:
            text "Incorrect" size 60 color "#FF4444" xalign 0.5 outlines [(3, "#731a1a", 0, 0)]

        null height 20

        text explanation size 28 color "#CCCCCC" xalign 0.5 text_align 0.5

        null height 40

        textbutton "Continue":
            xalign 0.5
            text_size 36
            text_color "#FFD700"
            action Return()


screen quiz_results(correct_count, total, num_choices, num_penalties):
    modal True

    add Solid("#1a0a2e")

    vbox:
        xalign 0.5
        yalign 0.4
        spacing 30

        text "Quiz Complete!" size 60 color "#FFD700" xalign 0.5 outlines [(3, "#8B6914", 0, 0)] font "gui/font/Poultrygeist.ttf"

        null height 20

        text "[correct_count] out of [total] correct" size 40 color "#FFFFFF" xalign 0.5

        null height 10

        if num_choices >= 3:
            text "Excellent! Choose from 3 modifiers" size 30 color "#00FF00" xalign 0.5
        elif num_choices == 2:
            text "Good! Choose from 2 modifiers" size 30 color "#88FF88" xalign 0.5
        elif num_choices == 1:
            text "Passable. Choose 1 modifier" size 30 color "#FFFF00" xalign 0.5
        elif num_penalties > 0:
            text "Poor knowledge... [num_penalties] penalt[num_penalties > 1 and 'ies' or 'y'] applied!" size 28 color "#FF4444" xalign 0.5
        else:
            text "No modifiers earned." size 28 color "#FF4444" xalign 0.5

        null height 40

        textbutton "Continue":
            xalign 0.5
            text_size 36
            text_color "#FFD700"
            action Return()


screen modifier_choice(choices):
    modal True

    add Solid("#1a0a2e")

    vbox:
        xalign 0.5
        yalign 0.08
        text "Choose Your Modifier" size 55 color "#FFD700" xalign 0.5 outlines [(3, "#8B6914", 0, 0)] font "gui/font/Poultrygeist.ttf"
        null height 5
        text "Your playstyle shaped these options" size 26 color "#AAAAAA" xalign 0.5

    hbox:
        xalign 0.5
        yalign 0.5
        spacing 40

        for mod in choices:
            button:
                xsize 400
                ysize 350
                background Frame(Solid("#2a1a4e"), 10, 10)
                hover_background Frame(Solid("#4a2a8e"), 10, 10)
                action Return(mod)
                padding (25, 25, 25, 25)

                vbox:
                    spacing 15
                    xsize 350

                    # Icon based on type
                    if mod.mod_type == "health_boost":
                        text "{size=50}{color=#FF4444}+{/color}{/size}" xalign 0.5
                    elif mod.mod_type == "speed_up":
                        text "{size=50}{color=#44FFFF}~{/color}{/size}" xalign 0.5
                    elif mod.mod_type == "extra_dash":
                        text "{size=50}{color=#FF44FF}>{/color}{/size}" xalign 0.5
                    elif mod.mod_type == "damage_up":
                        text "{size=50}{color=#FFAA00}!{/color}{/size}" xalign 0.5
                    elif mod.mod_type == "shield":
                        text "{size=50}{color=#4488FF}O{/color}{/size}" xalign 0.5

                    text mod.name size 28 color "#FFD700" xalign 0.5 text_align 0.5
                    text mod.description size 20 color "#CCCCCC" xalign 0.5 text_align 0.5


# Quiz variables
default quiz_current_question = None
default quiz_question_index = 0
default quiz_correct_count = 0


screen penalty_display(penalties):
    modal True

    add Solid("#1a0a2e")

    vbox:
        xalign 0.5
        yalign 0.08
        text "Penalties Applied" size 55 color "#FF4444" xalign 0.5 outlines [(3, "#731a1a", 0, 0)] font "gui/font/Poultrygeist.ttf"
        null height 5
        text "Your ignorance has consequences..." size 26 color "#AAAAAA" xalign 0.5

    hbox:
        xalign 0.5
        yalign 0.5
        spacing 40

        for mod in penalties:
            frame:
                xsize 400
                ysize 300
                background Frame(Solid("#4e1a1a"), 10, 10)
                padding (25, 25, 25, 25)

                vbox:
                    spacing 15
                    xsize 350

                    if mod.mod_type == "health_boost":
                        text "{size=50}{color=#FF4444}-{/color}{/size}" xalign 0.5
                    elif mod.mod_type == "speed_up":
                        text "{size=50}{color=#FF4444}~{/color}{/size}" xalign 0.5
                    elif mod.mod_type == "damage_up":
                        text "{size=50}{color=#FF4444}!{/color}{/size}" xalign 0.5

                    text mod.name size 28 color "#FF6666" xalign 0.5 text_align 0.5
                    text mod.description size 20 color "#CC8888" xalign 0.5 text_align 0.5

    vbox:
        xalign 0.5
        yalign 0.85

        textbutton "Continue":
            xalign 0.5
            text_size 36
            text_color "#FF4444"
            action Return()


label run_quiz(stage_num):
    $ questions = STAGE_QUESTIONS[stage_num]
    $ quiz_question_index = 0
    $ quiz_correct_count = 0

    window hide
    $ quick_menu = False

    stop music
    if stage_num in _quiz_music:
        play music _quiz_music[stage_num] fadein 1.0 volume 0.1


    while quiz_question_index < len(questions):
        $ quiz_current_question = questions[quiz_question_index]

        call screen quiz_screen(questions, stage_num)
        $ chosen = _return

        $ is_correct = (chosen == quiz_current_question.correct_index)
        if is_correct:
            $ quiz_correct_count += 1

        call screen quiz_feedback(is_correct, quiz_current_question.explanation)

        $ quiz_question_index += 1

    # Determine rewards or penalties based on quiz score
    # 5/5 = 3 positive modifiers
    # 4/5 = 2 positive modifiers
    # 3/5 = 1 positive modifier
    # 2/5 = 1 penalty
    # 1/5 = 2 penalties
    # 0/5 = 3 penalties
    $ _num_choices = 0
    $ _num_penalties = 0
    if quiz_correct_count >= 5:
        $ _num_choices = 3
    elif quiz_correct_count >= 4:
        $ _num_choices = 2
    elif quiz_correct_count >= 3:
        $ _num_choices = 1
    elif quiz_correct_count == 2:
        $ _num_penalties = 1
    elif quiz_correct_count == 1:
        $ _num_penalties = 2
    else:
        $ _num_penalties = 3

    call screen quiz_results(quiz_correct_count, len(questions), _num_choices, _num_penalties)

    # Positive modifiers: player chooses
    if _num_choices > 0:
        $ _modifier_pool = build_modifier_pool(combat_stage)
        $ _choices = _modifier_pool[:_num_choices]

        call screen modifier_choice(_choices)
        $ _chosen_mod = _return

        $ game_modifier_system.add_modifier(_chosen_mod)

    # Penalties: auto-applied, no choice
    if _num_penalties > 0:
        $ _penalty_pool = build_penalty_pool()
        $ _applied_penalties = _penalty_pool[:_num_penalties]

        python:
            for _penalty in _applied_penalties:
                game_modifier_system.add_modifier(_penalty)

        call screen penalty_display(_applied_penalties)
        stop music fadeout 1.0

    $ quick_menu = True
    window auto

    return
