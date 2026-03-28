init -2 python:

    class StageConfig():
        def __init__(self, stage_id, era_name, tile_map, enemy_types,
                    enemy_speed_range, spawn_interval, round_time,
                    background="images/zk_background.jpeg",
                    enemy_hp=1, requires_stomp=False, revive_seconds=0,
                    enemy_sprites=None, enemy_scales=None):
            self.stage_id = stage_id
            self.era_name = era_name
            self.tile_map = tile_map
            self.enemy_types = enemy_types
            self.enemy_speed_range = enemy_speed_range
            self.spawn_interval = spawn_interval
            self.round_time = round_time
            self.background = background
            self.enemy_hp = enemy_hp
            self.requires_stomp = requires_stomp
            self.revive_seconds = revive_seconds
            self.enemy_sprites = enemy_sprites if enemy_sprites else []
            self.enemy_scales = enemy_scales if enemy_scales else []

    # Stage configs — loaded from dashboard DB
    STAGE_CONFIGS = {}
