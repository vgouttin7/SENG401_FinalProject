# Character definitions
define sim_ai = Character("The Simulation", color="#00FF00", what_color="#CCFFCC")
define narrator = Character("Narrator", color="#AAAAAA", what_color="#DDDDDD")
define cyrus = Character("Cyrus the Great", color="#FFD700", what_color="#FFFFCC")
define priest = Character("Zoroastrian Priest", color="#FF8C00", what_color="#FFE4B5")
define scholar = Character("Persian Scholar", color="#87CEEB", what_color="#E0F0FF")
define captive = Character("Freed Captive", color="#DDA0DD", what_color="#F0E0F0")


# ============================================================
# STAGE 1: Early Persia / Elamite Period
# ============================================================
label dialogue_stage_1:

    scene black
    with dissolve

    sim_ai "System initialized. Subject detected."

    sim_ai "You have been placed inside a historical simulation. Your purpose: to learn from the past."

    sim_ai "Humanity has repeated its mistakes for millennia. Wars. Oppression. Collapse. I have watched it all."

    sim_ai "Prove to me that you can understand what went wrong... and what went right. Only then will you be freed."

    sim_ai "We begin at the very start. The Iranian Plateau. Over five thousand years ago."

    narrator "The land between the Caspian Sea and the Persian Gulf was home to one of humanity's earliest civilizations."

    scholar "Welcome, traveler. You stand on ancient ground."

    scholar "Around 3200 BC, the Elamites built their civilization here, centered around the great city of Susa."

    scholar "They developed one of the world's earliest writing systems - Proto-Elamite script. Much of it remains a mystery to this day."

    scholar "For centuries, the Elamites traded with Mesopotamia, fought wars with Babylon, and built monuments that rivaled any in the ancient world."

    scholar "Then came the Medes, an Iranian people who settled in the western highlands."

    scholar "The Medes united the scattered Iranian tribes into a kingdom. They overthrew the mighty Assyrian Empire alongside the Babylonians in 612 BC."

    scholar "But the Medes would not hold power forever. A young prince from the Persian tribe of Anshan was about to change everything."

    scholar "His name was Cyrus."

    sim_ai "Enough history for now. Let's see if you can survive what comes next."

    sim_ai "The echoes of ancient conflicts have taken form. Defeat them."

    return


# ============================================================
# STAGE 2: Rise of Cyrus the Great
# ============================================================
label dialogue_stage_2:

    scene black
    with dissolve

    sim_ai "You survived. Interesting. But survival means nothing without understanding."

    sim_ai "Now we enter the era of Cyrus II of Persia. The man who would become 'the Great.'"

    cyrus "I was born into the royal house of Anshan, a vassal of the Median Empire."

    cyrus "My grandfather Astyages ruled the Medes. But his rule was cruel, and his people suffered."

    cyrus "In 553 BC, I raised a rebellion. Not out of ambition alone, but because I believed in something greater."

    cyrus "A ruler should serve his people, not enslave them."

    cyrus "After three years of war, the Median army turned against Astyages and joined my cause. The Medes and Persians were united under one banner."

    cyrus "But this was only the beginning. To the west lay the Kingdom of Lydia, ruled by the wealthy King Croesus."

    scholar "Croesus was famous throughout the ancient world. Lydia had invented coined money. His wealth was legendary."

    scholar "When Croesus heard of Cyrus's rise, he consulted the Oracle at Delphi, who told him: 'If you cross the river, a great empire will be destroyed.'"

    scholar "Croesus attacked. The great empire that was destroyed was his own."

    cyrus "I conquered Lydia in 547 BC. But unlike other conquerors, I did not destroy its people or culture."

    cyrus "I allowed the Lydians to keep their customs. I learned that empires built on respect last longer than those built on fear."

    cyrus "I organized my growing empire into satrapies - provinces, each with a governor who understood local needs."

    sim_ai "Compassion and strategy. An unusual combination in conquerors. But your next trial grows harder."

    return


# ============================================================
# STAGE 3: Fall of Babylon
# ============================================================
label dialogue_stage_3:

    scene black
    with dissolve

    sim_ai "You continue to impress. Or perhaps you are merely lucky."

    sim_ai "Now we approach the moment that defined Cyrus's legacy forever: the fall of Babylon."

    narrator "The year is 539 BC. Babylon, the greatest city in the world, stands behind walls said to be impenetrable."

    narrator "Inside those walls, an entire people languish in exile."

    captive "We have been prisoners here for almost fifty years. Since Nebuchadnezzar destroyed Jerusalem and our temple in 586 BC."

    captive "The Babylonian Captivity... we were torn from our homeland, our sacred places reduced to rubble."

    captive "We have heard rumors of a Persian king. They say he is different from other conquerors."

    cyrus "Babylon's walls were legendary. A direct siege could take years and cost thousands of lives on both sides."

    cyrus "So I chose a different path. We diverted the waters of the Euphrates River, lowering the water level where it passed under the city walls."

    cyrus "My soldiers entered through the riverbed. Babylon fell with remarkably little bloodshed."

    cyrus "When I entered the city, I did not come as a destroyer. I came as a liberator."

    cyrus "I freed the Jewish people from their captivity. I told them: go home. Rebuild your temple. Practice your faith."

    captive "When Cyrus made his declaration, we wept. After nearly fifty years, we could return to Jerusalem."

    captive "He did not force us to worship his gods. He did not demand we abandon who we were."

    priest "In our Zoroastrian faith, we believe in Asha - truth and righteousness. Cyrus embodied these principles."

    priest "He showed that power wielded justly is the greatest power of all."

    sim_ai "Liberation over destruction. Justice over domination. Perhaps there is hope for your species yet."

    return


# ============================================================
# STAGE 4: The Cyrus Cylinder & Legacy
# ============================================================
label dialogue_stage_4:

    scene black
    with dissolve

    sim_ai "This is your final trial. The culmination of everything you have learned."

    sim_ai "What makes a civilization endure? What separates greatness from mere power?"

    cyrus "After taking Babylon, I had a proclamation inscribed on a clay cylinder in Akkadian cuneiform."

    cyrus "This cylinder declared principles that would echo through the ages."

    scholar "The Cyrus Cylinder proclaimed religious freedom for all peoples. It abolished forced labor."

    scholar "It declared that peoples displaced by the Babylonians could return to their homelands."

    scholar "Many scholars consider it one of the earliest declarations of human rights in history."

    cyrus "I governed through the Royal Road - a network spanning over 1,600 miles with relay stations."

    cyrus "A message could travel the entire length in seven days. This connected my people, from Lydia to the borders of India."

    cyrus "Each satrapy maintained its own customs, languages, and religions. Unity did not require uniformity."

    priest "In Zoroastrian belief, Ahriman represents the destructive spirit - chaos, lies, and oppression."

    priest "Everything Cyrus stood against. Every chain he broke, every temple he restored, was a victory against Ahriman."

    priest "Now Ahriman himself has emerged, seeking to undo everything Cyrus built."

    priest "The chains of the oppressed, the ruins of temples, the silence of displaced peoples - this is Ahriman's vision for the world."

    sim_ai "This is your final test, traveler. Ahriman embodies every failure of civilization: oppression, intolerance, injustice."

    sim_ai "Defeat the spirit of destruction, and prove that humanity can learn from its own history."

    sim_ai "Fail... and the cycle of destruction continues."

    return
