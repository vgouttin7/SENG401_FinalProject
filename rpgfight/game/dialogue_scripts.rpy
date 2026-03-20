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


