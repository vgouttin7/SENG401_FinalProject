init python:

    def build_stage(stage_config):
        """Build all game objects from a StageConfig's tile map."""
        misc_tiles = []
        platform_tiles = []
        portal_group = []
        beam_group = []
        enemy_group = []
        player = None

        tile_map = stage_config.tile_map

        for i in range(len(tile_map)):
            for j in range(len(tile_map[i])):
                val = tile_map[i][j]
                if val == 1:
                    misc_tiles.append(MapTile(j * 60, i * 60, 1))
                elif val in (2, 3, 4, 5):
                    platform_tiles.append(MapTile(j * 60, i * 60, val))
                elif val == 7:
                    portal_group.append(Portal(j * 60, i * 60, "green"))
                elif val == 8:
                    portal_group.append(Portal(j * 60, i * 60, "purple"))
                elif val == 9:
                    player = Player(j * 60 - 60, i * 60 + 60, platform_tiles, portal_group, beam_group)

        return player, enemy_group, platform_tiles, portal_group, beam_group, misc_tiles


    class CombatStage(renpy.Displayable):
        """The platformer combat stage. Configured per-stage via StageConfig."""

        WINDOW_WIDTH = 1920
        WINDOW_HEIGHT = 1080
        ENEMY_POINT_VALUE = 25

        def __init__(self, stage_config, modifier_system=None):
            renpy.Displayable.__init__(self)

            self.stage_config = stage_config

            # Build stage from tile map
            result = build_stage(stage_config)
            self.player = result[0]
            self.enemy_group = result[1]
            self.platform_tiles = result[2]
            self.portal_group = result[3]
            self.beam_group = result[4]
            self.misc_tiles = result[5]

            # Apply modifiers to player
            if modifier_system:
                modifier_system.apply_to_player(self.player)

            # Game state
            self.score = 0
            self.frame_count = 0
            self.round_time = stage_config.round_time
            self.spawn_interval = stage_config.spawn_interval

            # Playstyle tracking
            self.enemies_killed = 0
            self.damage_taken = 0
            self.beams_fired = 0

            self.pause_background = Solid("#000000", xsize=self.WINDOW_WIDTH, ysize=self.WINDOW_HEIGHT)

            self.main_text = stage_config.era_name
            self.mty = self.WINDOW_HEIGHT / 2 - 100

            self.sub_text = _("Press Enter to begin combat")
            self.sty = self.WINDOW_HEIGHT / 2 + 100

            self.keyboard = KeyboardInput()
            self.can_trigger_space_action = True
            self.can_trigger_shift_action = True
            self.is_paused = True

            self.lose = False
            self.won = False

        def render(self, width, height, st, at):
            r = renpy.Render(width, height)

            def render_pause_bg():
                bg = renpy.render(self.pause_background, width, height, st, at)
                r.blit(bg, (0, 0))

            def render_main_text(mty):
                mt = renpy.render(Fixed(Text(self.main_text, size=60, color="#FFD700",
                    outlines=[(4, "#8B6914", 0, 0)],
                    font="gui/font/Poultrygeist.ttf", xalign=0.5)), width, height, st, at)
                r.blit(mt, (0, int(mty)))

            def render_sub_text(sty):
                st_render = renpy.render(Fixed(Text(self.sub_text, size=60, color="#FFFFFF",
                    outlines=[(4, "#cccccc", 0, 0)],
                    font="gui/font/Poultrygeist.ttf", xalign=0.5)), width, height, st, at)
                r.blit(st_render, (0, int(sty)))

            if not self.is_paused:
                renpy.music.set_pause(False, channel="music")

                self.player.update(
                    self.keyboard, self.WINDOW_WIDTH, self.WINDOW_HEIGHT,
                    self.can_trigger_space_action, self.can_trigger_shift_action
                )
                self.player.render(r, st, at)

                self.can_trigger_space_action = False
                self.can_trigger_shift_action = False

                for enemy in self.enemy_group:
                    enemy.update(self.WINDOW_WIDTH, self.WINDOW_HEIGHT)
                    enemy.render(r, st, at)

                for beam in self.beam_group:
                    beam.update()
                    beam.render(r, st, at)

                for portal in self.portal_group:
                    portal.update()
                    portal.render(r, st, at)

                for platform in self.platform_tiles:
                    platform.update()
                    platform.render(r, st, at)

                for misc_tile in self.misc_tiles:
                    misc_tile.update()
                    misc_tile.render(r, st, at)

                self.update()
            else:
                renpy.music.set_pause(True, channel="music")
                render_pause_bg()
                render_main_text(self.mty)
                render_sub_text(self.sty)

                if self.keyboard.enter:
                    self.is_paused = False
                    renpy.music.set_pause(False, channel="music")

            renpy.redraw(self, 0)
            return r

        def event(self, ev, x, y, st):
            if ev.type == pygame.KEYDOWN:
                if ev.key == pygame.K_LEFT:
                    self.keyboard.left = True
                elif ev.key == pygame.K_RIGHT:
                    self.keyboard.right = True
                elif ev.key == pygame.K_SPACE:
                    self.keyboard.space += 1
                    if self.keyboard.space == 1:
                        self.can_trigger_space_action = True
                elif ev.key == pygame.K_LSHIFT or ev.key == pygame.K_RSHIFT:
                    self.keyboard.shift += 1
                    if self.keyboard.shift == 1:
                        self.can_trigger_shift_action = True
                elif ev.key == pygame.K_RETURN:
                    self.keyboard.enter = True
                elif ev.key == pygame.K_ESCAPE:
                    self.keyboard.escape = True
                    self.is_paused = not self.is_paused
                    self.main_text = "Paused"
                    self.sub_text = "Press Enter to continue"

            elif ev.type == pygame.KEYUP:
                if ev.key == pygame.K_LEFT:
                    self.keyboard.left = False
                elif ev.key == pygame.K_RIGHT:
                    self.keyboard.right = False
                elif ev.key == pygame.K_SPACE:
                    self.keyboard.space = 0
                elif ev.key == pygame.K_LSHIFT or ev.key == pygame.K_RSHIFT:
                    self.keyboard.shift = 0
                    self.player.refill_dashes()
                elif ev.key == pygame.K_RETURN:
                    self.keyboard.enter = False
                elif ev.key == pygame.K_ESCAPE:
                    self.keyboard.escape = False

            else:
                if renpy.map_event(ev, "pad_a_press"):
                    self.keyboard.space += 1
                    if self.keyboard.space == 1:
                        self.can_trigger_space_action = True
                elif renpy.map_event(ev, "pad_a_release"):
                    self.keyboard.space = 0

                if renpy.map_event(ev, "pad_b_press"):
                    self.keyboard.shift += 1
                    if self.keyboard.shift == 1:
                        self.can_trigger_shift_action = True
                elif renpy.map_event(ev, "pad_b_release"):
                    self.keyboard.shift = 0
                    self.player.refill_dashes()

                if renpy.map_event(ev, "pad_back_press"):
                    self.keyboard.enter = True
                elif renpy.map_event(ev, "pad_back_release"):
                    self.keyboard.enter = False

                if renpy.map_event(ev, "pad_start_press"):
                    self.keyboard.escape = True
                    self.is_paused = not self.is_paused
                    self.main_text = "Paused"
                    self.sub_text = "Press Enter to continue"
                elif renpy.map_event(ev, "pad_start_release"):
                    self.keyboard.escape = False

                if renpy.map_event(ev, "pad_leftx_neg") or renpy.map_event(ev, "pad_rightx_neg") or renpy.map_event(ev, "pad_dpleft_press"):
                    self.keyboard.left = True
                elif ((renpy.map_event(ev, "pad_leftx_zero") or renpy.map_event(ev, "pad_rightx_zero")) and self.keyboard.left) or renpy.map_event(ev, "pad_dpleft_release"):
                    self.keyboard.left = False

                if renpy.map_event(ev, "pad_leftx_pos") or renpy.map_event(ev, "pad_rightx_pos") or renpy.map_event(ev, "pad_dpright_press"):
                    self.keyboard.right = True
                elif ((renpy.map_event(ev, "pad_leftx_zero") or renpy.map_event(ev, "pad_rightx_zero")) and self.keyboard.right) or renpy.map_event(ev, "pad_dpright_release"):
                    self.keyboard.right = False

            renpy.restart_interaction()

            if self.lose:
                return "lose"
            elif self.won:
                return "won"
            else:
                raise renpy.IgnoreEvent()

        def update(self):
            self.frame_count += 1
            if self.frame_count % 60 == 0:
                self.round_time -= 1
                self.frame_count = 0

            self.check_collisions()
            self.add_enemy()
            self.check_round_completion()
            self.check_game_over()

        def add_enemy(self):
            if self.frame_count % 60 == 0:
                if self.round_time > 0 and self.round_time % self.spawn_interval == 0:
                    enemy_class = random.choice(self.stage_config.enemy_types)
                    min_spd, max_spd = self.stage_config.enemy_speed_range
                    enemy = enemy_class(
                        random.randint(100, self.WINDOW_WIDTH - 100), -100,
                        self.platform_tiles, self.portal_group,
                        min_spd, max_spd
                    )
                    enemy.hp = self.stage_config.enemy_hp
                    self.enemy_group.append(enemy)

        def kill_enemy(self, enemy):
            """Remove enemy and add score."""
            self.enemy_group.remove(enemy)
            self.score += self.ENEMY_POINT_VALUE
            self.enemies_killed += 1

        def check_collisions(self):
            requires_stomp = self.stage_config.requires_stomp

            # Beam hits enemy
            for enemy in self.enemy_group:
                if enemy.is_dead:
                    continue
                for beam in self.beam_group:
                    if enemy.is_colliding(beam):
                        renpy.sound.play("audio/zk_zombie_hit_sound.wav")
                        self.beam_group.remove(beam)
                        self.beams_fired += 1
                        enemy.hp -= 1

                        if enemy.hp <= 0:
                            if requires_stomp:
                                # Knock down, wait for stomp
                                enemy.is_dead = True
                                enemy.animate_death = True
                            else:
                                # Instant kill
                                self.kill_enemy(enemy)
                        # else: enemy took damage but keeps walking

            # Player touches enemy
            for enemy in self.enemy_group:
                if enemy.is_colliding(self.player):
                    if enemy.is_dead:
                        # Stomp downed enemy to finish it
                        renpy.sound.play("audio/zk_zombie_kick_sound.wav")
                        self.kill_enemy(enemy)
                    else:
                        # Living enemy hurts player
                        damage = int(20 / max(self.player.damage_multiplier, 0.25))
                        self.player.health -= damage
                        self.damage_taken += damage
                        renpy.sound.play("audio/zk_player_hit_sound.wav")
                        self.player.position.x -= 256 * enemy.direction


        def check_round_completion(self):
            if self.round_time <= 0:
                self.won = True
                renpy.timeout(0)

        def check_game_over(self):
            if self.player.health <= 0:
                # SHIELD: survive one fatal blow, restore to 25% health
                if self.player.has_shield:
                    self.player.has_shield = False
                    self.player.health = self.player.max_health // 4
                    self.player.reset()
                else:
                    self.lose = True
                    renpy.timeout(0)


    # HUD display functions
    def display_combat_score(st, at):
        return Text(_("Score: ") + "%d" % combat_stage.score, size=40, color="#FFFFFF",
                    outlines=[(4, "#cccccc", 0, 0)], font="gui/font/Pixel.ttf"), .1

    def display_combat_health(st, at):
        return Text(_("Health: ") + "%d" % combat_stage.player.health, size=40, color="#FFFFFF",
                    outlines=[(4, "#cccccc", 0, 0)], font="gui/font/Pixel.ttf"), .1

    def display_combat_stage_name(st, at):
        return Text(combat_stage.stage_config.era_name, size=40, color="#FFD700",
                    outlines=[(4, "#8B6914", 0, 0)], font="gui/font/Pixel.ttf"), .1

    def display_combat_time(st, at):
        return Text(_("Time: ") + "%d" % combat_stage.round_time, size=40, color="#FFFFFF",
                    outlines=[(4, "#cccccc", 0, 0)], font="gui/font/Pixel.ttf"), .1



screen combat_screen():
    add combat_stage.stage_config.background xsize 1920 ysize 1080
    add combat_stage

    if not combat_stage.is_paused:
        add DynamicDisplayable(display_combat_score) xalign 0.0 xoffset 20 yalign 0.95
        add DynamicDisplayable(display_combat_health) xalign 0.0 xoffset 20 yalign 1.0

        add DynamicDisplayable(display_combat_stage_name):
            xalign 0.5
            yalign 0.98

        add DynamicDisplayable(display_combat_time) xalign 1.0 xoffset -20 yalign 1.0
