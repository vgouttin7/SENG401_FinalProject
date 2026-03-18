# Image definitions

# Background images
image bg gray = Solid("#a9a9a9")

# Simulation images
image sim_ai neutral = "images/simulation/simulation neutral1.jpg"
image sim_ai angry = "images/simulation/simulation angry1.jpg"

# Narrator images
image narrator mouth1 = "images/narrator/narrator mouth1.jpg"
image narrator mouth2 = "images/narrator/narrator mouth2.jpg"
image narrator mouth3 = "images/narrator/narrator mouth3.jpg"

image narrator talking:
    "narrator mouth1"
    pause 0.15
    "narrator mouth2"
    pause 0.15
    repeat

image narrator still = "narrator mouth1"

# Cyrus images
image cyrus neutral = "images/cyrus/cyrus neutral2.jpg"
image cyrus angry = "images/cyrus/cyrus angry2.jpg"
image cyrus proud = "images/cyrus/cyrus proud2.jpg"
image cyrus point = "images/cyrus/cyrus point3.jpg"

# Priest images
image priest smile = "images/priest/priest smile4.jpg"

# Scholar images
image scholar smile = "images/scholar/scholar smile7.jpg"
image scholar smile6 = "images/scholar/scholar smile6.jpg"
image scholar point = "images/scholar/scholar point1.jpg"

# Captive images
image captive neutral = "images/captive/captive neutral3.jpg"
image captive sad = "images/captive/captive sad.jpg"

# Character text definitions
define sim_ai = Character("The Simulation", color="#00FF00", what_color="#CCFFCC", image="sim_ai")
define narrator = Character("Narrator", color="#AAAAAA", what_color="#DDDDDD", image="narrator")
define cyrus = Character("Cyrus the Great", color="#FFD700", what_color="#FFFFCC", image="cyrus")
define priest = Character("Zoroastrian Priest", color="#FF8C00", what_color="#FFE4B5", image="priest")
define scholar = Character("Persian Scholar", color="#87CEEB", what_color="#E0F0FF", image="scholar")
define captive = Character("Freed Captive", color="#DDA0DD", what_color="#F0E0F0", image="captive")


# ============================================================
# STAGE 1: Early Persia / Elamite Period
# ============================================================
label dialogue_stage_1:

    scene bg gray
    with dissolve

    stop music

    sim_ai "System initialized. Subject detected."

    show sim_ai neutral
    sim_ai "You have been placed inside a historical simulation. Your purpose: to learn from the past."

    show sim_ai angry
    sim_ai "Humanity has repeated its mistakes for millennia. Wars. Oppression. Collapse. I have watched it all."

    sim_ai "Prove to me that you can understand what went wrong... and what went right. Only then will you be freed."

    show sim_ai neutral
    sim_ai "We begin at the very start. The Iranian Plateau. Over five thousand years ago."


# ============================================================
    #narrator dialogue
    scene bg gray

    play music "audio/story1_background_music.mp3" fadein 1.0 volume 0.2

    show narrator talking
    narrator "The land between the Caspian Sea and the Persian Gulf was home to one of humanity's earliest civilizations."

# ============================================================
    #scholar dialogue
    scene bg gray


    show scholar smile
    scholar "Welcome, traveler. You stand on ancient ground."

    show scholar smile6
    scholar "Around 3200 BC, the Elamites built their civilization here, centered around the great city of Susa."
    scholar "They developed one of the world's earliest writing systems, the  Proto-Elamite script. Much of it remains a mystery to this day."

    show scholar smile
    scholar "For centuries, the Elamites traded with Mesopotamia, fought wars with Babylon, and built monuments that rivaled any in the ancient world."
    scholar "Then came the Medes which were the Iranian people who settled in the western highlands."

    show scholar point
    scholar "The Medes united the scattered Iranian tribes into a kingdom. They overthrew the mighty Assyrian Empire alongside the Babylonians in 612 BC."
    scholar "But the Medes would not hold power forever. A young prince from the Persian tribe of Anshan was about to change everything."
    scholar "His name was Cyrus."

# ============================================================
    #simulation dialogue
    scene bg gray


    show sim_ai neutral
    sim_ai "Enough history for now. Let's see if you can survive what comes next."

    show sim_ai angry
    sim_ai "The echoes of ancient conflicts have taken form. Defeat them."

    return


# ============================================================
# STAGE 2: Rise of Cyrus the Great
# ============================================================
label dialogue_stage_2:
    stop music fadeout 1.0

    scene bg gray
    with dissolve


    #simulation dialogue
    show sim_ai neutral
    sim_ai "You survived. Interesting. But survival means nothing without understanding."
    sim_ai "Now we enter the era of Cyrus II of Persia. The man who would become 'the Great.'"

# ============================================================
    #cyrus dialogue
    scene bg gray

    play music "audio/story2_background_music.mp3" volume 0.2


    show cyrus proud
    cyrus "I was born into the royal house of Anshan, a vassal of the Median Empire."

    show cyrus neutral
    cyrus "My grandfather Astyages ruled the Medes. But his rule was cruel, and his people suffered."
    cyrus "In 553 BC, I raised a rebellion. Not out of ambition alone, but because I believed in something greater."

    show cyrus angry
    cyrus "A ruler should serve his people, not enslave them."

    show cyrus point
    cyrus "After three years of war, the Median army turned against Astyages and joined my cause. The Medes and Persians were united under one banner."

    show cyrus neutral
    cyrus "But this was only the beginning. To the west lay the Kingdom of Lydia, ruled by the wealthy King Croesus."

# ============================================================
    #scholar dialogue
    scene bg gray


    show scholar point
    scholar "Croesus was famous throughout the ancient world. Lydia had invented coined money. His wealth was legendary."

    show scholar smile6
    scholar "When Croesus heard of Cyrus's rise, he consulted the Oracle at Delphi, who told him: 'If you cross the river, a great empire will be destroyed.'"

    show scholar smile
    scholar "Croesus attacked. The great empire that was destroyed was his own."

# ============================================================
    #cyrus dialogue
    scene bg gray

    show cyrus point
    cyrus "I conquered Lydia in 547 BC. But unlike other conquerors, I did not destroy its people or culture."

    show cyrus neutral
    cyrus "I allowed the Lydians to keep their customs. I learned that empires built on respect last longer than those built on fear."

    show cyrus proud
    cyrus "I organized my growing empire into satrapies - provinces, each with a governor who understood local needs."


# ============================================================
    #simulation dialogue
    scene bg gray

    show sim_ai angry
    sim_ai "Compassion and strategy. An unusual combination in conquerors. But your next trial grows harder."

    return


# ============================================================
# STAGE 3: Fall of Babylon
# ============================================================
label dialogue_stage_3:
    stop music fadeout 1.0

    scene bg gray
    with dissolve


# ============================================================
    #simulation dialogue
    show sim_ai neutral
    sim_ai "You continue to impress. Or perhaps you are merely lucky."
    sim_ai "Now we approach the moment that defined Cyrus's legacy forever: the fall of Babylon."

# ============================================================
    #narrator dialogue
    scene bg gray

    play music "audio/story3_background_music.mp3" fadein 1.0 volume 0.2


    show narrator talking
    narrator "The year is 539 BC. Babylon, the greatest city in the world, stands behind walls said to be impenetrable."
    narrator "Inside those walls, an entire people languish in exile."

# ============================================================
    #captive dialogue
    scene bg gray

    show captive sad
    captive "We have been prisoners here for almost fifty years. Since Nebuchadnezzar destroyed Jerusalem and our temple in 586 BC."
    captive "The Babylonian Captivity... we were torn from our homeland, our sacred places reduced to rubble."

    show captive neutral
    captive "We have heard rumors of a Persian king. They say he is different from other conquerors."

# ============================================================
    #cyrus dialogue
    scene bg gray


    show cyrus neutral
    cyrus "Babylon's walls were legendary. A direct siege could take years and cost thousands of lives on both sides."

    show cyrus point
    cyrus "So I chose a different path. We diverted the waters of the Euphrates River, lowering the water level where it passed under the city walls."
    cyrus "My soldiers entered through the riverbed. Babylon fell with remarkably little bloodshed."

    show cyrus neutral
    cyrus "When I entered the city, I did not come as a destroyer. I came as a liberator."

    show cyrus proud
    cyrus "I freed the Jewish people from their captivity. I told them: go home. Rebuild your temple. Practice your faith."

# ============================================================
    #captive dialogue
    scene bg gray

    show captive sad
    captive "When Cyrus made his declaration, we wept. After nearly fifty years, we could return to Jerusalem."

    show captive neutral
    captive "He did not force us to worship his gods. He did not demand we abandon who we were."

# ============================================================
    #priest dialogue
    scene bg gray

    show priest smile
    priest "In our Zoroastrian faith, we believe in Asha - truth and righteousness. Cyrus embodied these principles."

    priest "He showed that power wielded justly is the greatest power of all."

# ============================================================
    #simulation dialogue
    scene bg gray

    show sim_ai neutral
    sim_ai "Liberation over destruction. Justice over domination. Perhaps there is hope for your species yet."

    return


# ============================================================
# STAGE 4: The Cyrus Cylinder & Legacy
# ============================================================
label dialogue_stage_4:
    stop music fadeout 1.0

    scene bg gray
    with dissolve


# ============================================================
    #simulation dialogue
    scene bg gray


    show sim_ai neutral
    sim_ai "This is your final trial. The culmination of everything you have learned."
    sim_ai "What makes a civilization endure? What separates greatness from mere power?"

# ============================================================
    #cyrus dialogue
    scene bg gray


    play music "audio/story4_background_music.mp3" fadein 1.0 volume 0.2
    show cyrus neutral
    cyrus "After taking Babylon, I had a proclamation inscribed on a clay cylinder in Akkadian cuneiform."
    show cyrus point
    cyrus "This cylinder declared principles that would echo through the ages."


# ============================================================
    #scholar dialogue
    scene bg gray


    show scholar smile6
    scholar "The Cyrus Cylinder proclaimed religious freedom for all peoples. It abolished forced labor."
    scholar "It declared that peoples displaced by the Babylonians could return to their homelands."

    show scholar point
    scholar "Many scholars consider it one of the earliest declarations of human rights in history."


# ============================================================
    #cyrus dialogue
    scene bg gray

    show cyrus neutral
    cyrus "I governed through the Royal Road - a network spanning over 1,600 miles with relay stations."
    show cyrus point
    cyrus "A message could travel the entire length in seven days. This connected my people, from Lydia to the borders of India."
    show cyrus neutral
    cyrus "Each satrapy maintained its own customs, languages, and religions. Unity did not require uniformity."


# ============================================================
    #priest dialogue
    scene bg gray


    show priest smile
    priest "In Zoroastrian belief, Ahriman represents the destructive spirit - chaos, lies, and oppression."

    priest "Everything Cyrus stood against. Every chain he broke, every temple he restored, was a victory against Ahriman."

    priest "Now Ahriman himself has emerged, seeking to undo everything Cyrus built."

    priest "The chains of the oppressed, the ruins of temples, the silence of displaced peoples - this is Ahriman's vision for the world."


# ============================================================
    #simulation dialogue
    scene bg gray

    show sim_ai neutral
    sim_ai "This is your final test, traveler. Ahriman embodies every failure of civilization: oppression, intolerance, injustice."

    sim_ai "Defeat the spirit of destruction, and prove that humanity can learn from its own history."
    show sim_ai angry
    sim_ai "Fail... and the cycle of destruction continues."

    return
