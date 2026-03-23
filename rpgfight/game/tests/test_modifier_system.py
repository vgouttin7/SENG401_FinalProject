#Victor Gouttin
#Test for modifier_system.rpy
from rpgfight.game.modifier_system import ModifierSystem, Modifier

#test adding modifier
#after one modifier gets added, total should be 1
def test_add_modifier():
    ms = ModifierSystem()
    mod = Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health")
    ms.add_modifier(mod)
    assert len(ms.active_modifiers) == 1

#test total calculation for one modifier
#after adding one health boost of 50, total should be 50
def test_get_total_single():
    ms = ModifierSystem()
    ms.add_modifier(Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health"))
    assert ms.get_total(Modifier.HEALTH_BOOST) == 50

#test total calculation for multiple modifiers
#after adding two health boosts of 50 and 50, total should be 80
def test_get_total_multiple():
    ms = ModifierSystem()
    ms.add_modifier(Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health"))
    ms.add_modifier(Modifier(Modifier.HEALTH_BOOST, 50, "HP+", "Increase health"))
    assert ms.get_total(Modifier.HEALTH_BOOST) == 100
