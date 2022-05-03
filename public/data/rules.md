# Getting Started
Battle Forge is a set of modular wargame rules to use with your favorite miniatures or even some green plastic army men and is a great set of rules for beginners to wargaming. In our [Game Modules](/games) you can find the game modules we support. If you have an idea for a cool game setting, you can join our [Discord](https://discord.gg/M9sets4) and let us know.
## Game Materials
To get started you'll need the following items:
* Two sets of miniatures (somewhere between 15-30 miniatures per side depending on the faction you choose) or something to represent your models (counters or tokens are fine)
* A tape measure or other measuring device with inches
* A set of D10 dice (about 10 or is ideal but you can theoretically play with just one)
* A table (or floor) to play on with optional terrain (books or other household items will do just fine)

# General Principles
These are some general rules to get you started and will be referenced throughout the rules.
## Skill Checks
When a unit is required to take a stat check, roll 1D10 and if the value is equal to or less than the stat, modified by any modifiers, the test is successful.
## Dice And Modifiers
Modifiers apply to the required result for the test being taken (+1 Accuracy on an Accuracy 4 model means a 5 is now required).
Rolls of 1 are automatically passed regardless of modifiers and rolls of 10 automatically fail.
## D10 Scattering
Some rules may refer to scattering using a D10. To do so, roll a D10 and following the point on the D10 as well as the value to find the new landing location. If an attack scatters off the table, it simply misses. If a unit is arriving from reserves or is required to scatter for another reason and it scatters off the table, place it at the closest point on the table edge.
![Scattering](/data/diagrams/scatter2.png)
# Datasheets
At the core of the game, units have many different abilities and stat-lines to represent the diverse units possible.
![Datasheet](/data/diagrams/datasheet_new.png)
## Units and Models
Every unit has the following basic stats that are used for normal skill checks.
### Unit Characteristics
All units have the following characteristics:
![Models](/data/diagrams/models_new2.png)
#### Points (pts)
This is the unit's cost for including it in your army lists (see list building section for more).
#### Category
This is the unit's category for list building purposes (see list building section for more).
#### Composition
This is a list of the unit's models and what each model is equipped with. It will list any optional addons to the unit.
#### Special Rules
This is a list of special rules applied to all models in the unit.

__Ability Targets:__ Some models have abilities which can target friendly units. Those units must be from the same faction as the user of the ability.

#### Unit Options
This is a list of option weapons or upgrades that may be changed on a unit to further customize their role.
#### Keywords
This is a list of keywords that are referenced by some abilities. These are typically a unit's model type and faction.
### Model Characteristics
Each model in a unit has the following characteristics:
![Statline](/data/diagrams/statline.png)

#### Movement (Mov)
This is the unit's base movement distance in inches.
#### Accuracy (Acc)
This is the value required to hit when performing a shooting attack.
#### Strength (Str)
This is the value required to hit when performing a melee attack.
#### Save (Sav)
This is the value required when attempting to stop enemy attacks.
#### Initiative (Init)
This is the value required when attempting to cross terrain, escape from assaults or perform reactions.
#### Courage (Co)
This is the value required when attempting to clear Shock or take break tests.
#### Special
Any special rules associated with this particular model.

__Models without Characteristics:__ Some units contains models which do not have characteristics or lack a Save characteristic. Those models cannot be assigned hits and are automatically removed when the rest of the unit is destroyed.

## Weapons
The following describes characteristics all weapons have.
### Name and Copies
This is the name of the weapon. Next to the name you may see a (X). This indicates a unit may make multiple attacks with that weapon or that it has multiple copies of that weapon.

__For Example:__ A unit may be equipped with Rifle(2). That means that unit may attack with its Rifle weapon twice. Another example is Knife(2). That unit may attack with its Knife weapon twice in melee. This is a full attack, and so the model gets all attacks listed on the weapon's profile.

### Weapon Characteristics
All weapons have the following characteristics:
![Weapons](/data/diagrams/weapons2.png)
#### Range
The weapon's attack range divided into two bands (short, long). A weapon may only target units inside the weapon's attack range. Some weapons only have "Melee" listed as their range. These weapons may only be used in close combat.
#### Attacks (A)
The number of attacks a model may make with this weapon.
#### Armor Penetration (AP)
The armor penetration characteristic of this weapon.
#### Special Rules
Any special rules that affect this weapon.

# Game Rounds
The following phases are done in order each round after which a new round begins.

## Bidding Phase
In the bidding phase, both players will secretly bid a number of Shock to try to gain the activation advantage. To do this, both players will choose a number of Shock they are willing to sustain this round. Then, both players simultaneously reveal their number and the player with the higher value may activate units equal to the difference in their values first. If there is a tie, both players roll off to determine the first activation and that player may activate one unit first.
For each Shock a player bids, they must assign a Shock to one of their units on the field, even if they lose the bid. 

### Shock Limit
Units must stay below half their Courage when assigning Shock. If all Shock cannot be assigned, assign as much as possible, and forfeit any activation bonuses. If both players fail to assign Shock, roll off to determine who gets first activation.

__Example:__ I bid 3 Shock, and my opponent bids 1 Shock. I must assign 3 Shock to my units and my opponent must assign 1. Now, I may activate 2 units before my opponent (3-1 = 2) because I bid the higher value. If I have a unit with Courage 6, I must stay below half that unit's courage of shock so I may only assign 2 to that unit.

## Actions Phase
Players alternate activating one unit and performing two actions with that unit, starting with the player that won the bidding phase. Play continues until both players have activated all units. When activated, a unit may choose two actions to complete as its activation. They may be done more than once unless otherwise specified.

__Unit Activations:__ A unit may only be activated a single time per round, regardless of any abilities which allow for free activations.

## End Phase
During this phase, players decide if any of their units will retain standby actions. Additionally, players will score any end-of-round VP for the current scenario and resolve abilities which occur at the end of the round.

# Actions
All units may perform actions. Some actions are specific to the scenario being played and some are available on unit or model abilities.

## Available Actions
The following actions are available to all units.

### Focus
The unit focuses and gains +1 Accuracy and Strength with its next attack.
### Shoot
The unit attacks with all equipped Ranged weapons. Units may only shoot once per round.
### Fight
The unit fights will all equipped melee weapons in close combat. A unit may only fight once per round. If a unit has no Melee weapons, it may not perform Fight actions.
### Move
All models in the unit move up to their movement characteristic.
#### Rushing
When performing a move action, a unit may attempt to rush. The unit takes an Initiative skill check. If passed, the unit may move an additional number of inches equal to half its movement characteristic rounded down with that Move action. If failed, the unit takes a Shock at the end of the Move and does not gain any benefit. Units may never rush across obstacles or through difficult terrain.
### Charge
The unit declares a target and makes a move action into base contact with it and may make a free fight action. A unit may not charge if already in close combat. A unit may only use a Charge action if it is in range of an enemy unit it can reach with its move action.
### Hold
The unit prepares itself and may perform a reaction later in the round. It may automatically perform an Overwatch or Counter Attack reaction without having to test. All other reactions will require the unit to test.
### Evade
The unit attemps to evade incoming attacks. Mark that the unit has Evaded with a token. When the unit is targeted by a Shooting or Fighting attack, that unit may spend the token to cause the attacking unit to suffer -1 Accuracy and -1 Strength for that attack.
### Rally
The unit attempts to regroup and prepare to fight on. Roll a Courage check for each Shock on the unit and any successes remove one Shock.
## Simultaneous Actions
Some rules may instruct players to perform actions simultaneously. What this means, is the currently active player will perform the action in its entirety without applying its effects, and then the target player will perform the action. After both players have had an opportunity to perform the action un-interrupted the effects are resolved such as removing models or apply status effects such as Shock.

__For Example:__ It is my activation and I am shooting at an enemy unit. That unit performs the Return Fire reaction (described later under reactions). I would resolve my shooting attack entirely and determine how many models are hit and killed (without removing the models from the target unit until they have had an opportunity to perform their shoot action). Then, my opponent would perform their shooting action and determine the number of models hit and killed in my unit. After we have both performed the action, we both remove any killed models and apply and effects such as Shock from the attack.
## Group Activations
Some units have the ability to perform group activations. This means that unit will activate with other units as a group and perform activations together. Units which can group activate will have a special rule permitting them to do so and that rule will specify how many other units may activate. When performing group activations, all units must perform the same actions together. The units perform all actions simultaneously. A unit may only be part of a group activation if it has not yet activated. Once any units are part of a group activation, they may not activate again later in the round.
# Movement
Each model in a unit making a Move action may move up to its movement characteristic in any direction. At the end of a unit's move, models in the unit must maintain a 2" coherency and may not be more than 6" away from any other model from the unit. Models may move through other friendly models so long as they do not end their movement on top of any friendly models. Models may not move within 1" of an enemy model unless charging that unit.
![Movement](/data/diagrams/movement.png)
## Unit Facing
Units may end their movement in any orientation so long as this does not move the unit beyond its movement characteristic.
## Crossing Low Obstacles
Units crossing an obstacle that is 2" or less in height during their move must take an Initiative skill check. If failed, the unit loses 2" of Movement for that action. If passed, the unit may continue to move without penalty.
## Climbing Terrain
When climbing an obstacle, first measure its height. If a unit does not have enough movement speed to reach the top, it may not attempt to climb.
To climb an obstacle during their move must take an Initiative skill check. If failed, the unit halves its remaining movement. If passed, the unit may continue to move without penalty. If a unit no longer has enough movement distance after failing the test to climb the obstacle it may not do so.
## Leaping Across Gaps
Units may attempt to jump a gap which they have the movement distance to cross. To do this, take an Initiative test. If passed, the gap is successfully crossed. If failed, follow the rules for falling, and place the unit on the surface below the gap.
## Jumping or Falling Down
Jumping or falling units must take an Initiative test if they fall or jump down a height of more than 3". If failed, all models in the unit must take a Save roll. If passed, the unit hits the ground and may continue normally.
# Shooting
Shooting at the enemy is the surest way to get them to rout from the field. Models may come equipped with various weapons, but firing them is all very similar. In order to shoot at a target unit, its target must be within range of the weapon being used. Units may never shoot at enemy units that are engaged in melee with friendly units. This is simply too much risk to friendly units.

__For Example:__ My model is equipped with a Rifle that has 12"/24" range. The target must be at least inside the weapon's Long range band of 24" to shoot at it.
![Shooting](/data/diagrams/shooting.png)
## Line of Sight (LOS)
Before shooting, make sure a model can "see" its target. Get down at eye level with a model if it is difficult to tell. If a model’s stance makes it difficult to see any targets, replace it with a different model with the same equipment and check its line of sight. Models where only 1/3 or less is visible do not count as being visible. With adequate cover and intervening terrain, it is okay to be generous here.
### LOS For Mounted Weapons
Each unit has 4 arcs, Front, Left, Right and Rear. These are relative to the front of the unit. Before the game, if there are any questions as to what is the front of a unit, players should agree and keep that consistent for the game. If a unit is in more than one arc, always choose the best arc for the shooter. Ranges and arcs are measured from the mounting point of the weapon on the unit or barrel of the weapon if it has one.
![Arc Diagram](/data/diagrams/arcs.png)
## Shooting Sequence
When a unit shoots, it may attack with all its equipped weapons. All instances of the same weapon must target the same unit. Any split fire must be declared before attacks are rolled.

__Impossible Shots:__ Units may declare shots that are impossible (units that may not be targeted etc). If during the attack rolls that unit becomes available to attack, those shots can then be resolved. If not, those shots are not made.

### Roll To Hit
For each weapon, roll a number of D10 equal to the number of attacks the weapon has. Any results that are equal to or less than the unit's Accuracy skill are successful "hits" and must be saved by the defender.

__Extra Hits:__ Abilities which grant extra hits (1 hit counts as 2 for example) do not benefit from other weapon abilities which trigger on the same value. They are simply one extra hit with the weapon's base profile. For example, I have an ability which grants extra hits on 2 or less and one where hit rolls of 2 or less gain +1 AP. The extra hits would not gain +1 AP.

#### Long Range
If a unit's target is outside a weapon's Short range band and in range of its Long range band it suffers -1 to its Accuracy rolls.
### Save Rolls
For each "hit" suffered, the defender must assign the hit to a model. Only models that were valid targets of that attack may be assigned hits (models out of line of sight or otherwise may not be hit by that attack). Abilities or special rules which allow a model to negate hits are applied after the hit is assigned. A unit may only use one such ability, so choose the best one.
For each hit, roll a D10 and subtract the AP value of the weapon from the target's Save characteristic. Each result that is equal to or less than the defender's Save is successfully stopped. Any remaining hits cause the target to lose 1 wound or be killed if the target has only 1 wound. Any models with zero wounds are then removed from the table as casualties.

__Automatic Failures:__ Save rolls of 10 always fail, as do any other skill checks on 10s. For the purposes of any abilities which measure the amount the Save was failed by, subtract the unit's Save value from 10. For example, I fail a Save roll on a 10 and my unit has Save 12. I have failed that Save by -2 and would use -2 for any rules which reference how much a Save was failed by.

#### Point Blank Range
If a shooting attack takes place at a range of 3" or less, models do not benefit from any cover bonuses (explained later in the terrain section).

# Fighting
Fighting in close combat can be a deadly affair, but the most sure way to remove an enemy from a dug-in position.
## Who Can Fight
Models in base contact, or within 0.5" of a model that is in base contact with an enemy model may attack in Melee. Units may choose to split their attacks among any enemy units they are engaged with, provided the models are in range to attack that unit.

__Impossible Attacks:__ Units may declare attacks that are impossible (units that may not be targeted etc). If during the attack rolls that unit becomes available to attack, those attacks can then be resolved. If not, those attacks are not made.

## Attacking Sequence
Hit and Save rolls are identical to the shooting sequence, however units use any weapons designated with the "Melee" range in close combat and hit on their Strength skill instead of Accuracy.
#### Intervening Terrain
Units fighting across a piece of terrain suffer -1 to Strength rolls.
## Consolidate
After a unit has finished a Fight action, models in the unit may move up to 3" to close in with the enemy. This move must end closer to the closest enemy unit. The unit must not end its move out of coherency.
## Engaged In Combat
Units with models still in base contact remain locked in melee and may fight again in the next game round. In order to leave combat, the unit must fall back.

## Falling Back
Units wishing to fall back from melee with a Move action (or must do so after failing a break test) must pass an Initiative skill check to successfully retreat. If failed, all units engaged with that unit may make a free melee attack action against that unit. If the unit manages to escape with any models left, it may perform its move action normally.

# Morale and Shock
When units come under fire, their effectiveness decreases and they may even be forced to fall back.

## Shock
When units are shot at or assaulted, they begin to get exhausted and may decide not to act at all. We represent this with Shock.

### Gaining Shock
Units gain a Shock when any of the following occur:
* A unit is hit by an attack
* A unit within 3" is destroyed

A unit may only inflict a maximum of one Shock on a target unit unless a special rule specifies otherwise.
![Gaining Shock](/data/diagrams/shock.png)
### Effects of Shock
Shock causes units to perform worse and move less under pressure. For each shock a unit has, it suffers the following effects:
* -1 Accuracy
* -1 Strength
* -1 Movement
* -1 Initiative

### Removing Shock
When a unit is activated, before any actions are taken, take one Courage skill check for each Shock. For each passed test, remove one Shock.

## Break Tests
A unit must take a break test in any of the following situations:
* After a unit receives shock, if it has shock equal to or greater than its Courage value
* If a unit loses more than half its models or Wounds(x) in one attack

A break test is a single Courage skill check, and if failed, the unit breaks. The unit must move 6" away from the closest enemy unit, after which the unit performs an Evade action. If the unit cannot fall back 6" away from the closest enemy unit (in the case it is surrounded or otherwise, it surrenders and is immediately destroyed instead).

# Reactions
Reactions allow units to perform actions out of the normal activation sequence. Units may make a reaction in a variety of situations as described in each reaction's requirements. A unit may only make a reaction if they have not yet taken any actions this round or if they are on Hold. Once a unit has made a reaction, that unit may no longer perform any further actions this round.

## Making A Reaction
To make a Reaction, a unit declares which reaction they are attempting to make and takes an Initiative skill check. If passed, the unit may perform the declared reaction and if failed, the unit takes 1 Shock.

## Available Reactions
Units may make any of the following reactions.
### Dodge
When a unit is targeted by an attack it may attempt a Dodge reaction. With a Dodge reaction, a unit attempts to dodge out of the way of the attack and avoid being hit. If successful, immediately make an Evade action.

### Overwatch
Units may react when a Charge action is declared against them or a Move action is performed in their line of sight by attempting an Overwatch reaction. If successful, the unit may make a full shooting attack against the Charging or Moving unit measured from any point in the unit's Move. A unit that is on Hold may automatically perform an Overwatch reaction. No test is required for this reaction as a Hold action has already been performed.

### Counter Attack
When a Fight or Shoot action is declared against a unit, it may attempt a Counter Attack reaction. If successful, the unit may simultaneously make a Fight or Shoot action against the attacking unit. A unit that is on Hold may automatically perform a Counter Attack reaction against an enemy unit that Fights or Shoots it. No test is required for this reaction as a Hold action has already been performed.

### Escape
When a Fight, Shoot, or Charge action is declared against a unit, it may attempt an Escape reaction. If successful, the target unit may make a full move action before the Shoot, Fight or Charge action is performed.

# Terrain and Cover
Units in cover are much less susceptible to enemy fire and gain bonuses depending on their level of cover. 
Players should agree on terrain types and 1 capacities before the game begins to avoid slowing the game down.
## Obstacles
Any piece of terrain that is linear and may block movement such as a wall or hedge. Units only receive cover from an obstacle if the defending unit is within 2" of the obstacle and the majority of attacks from the attacking unit cross that obstacle.

__Low Obstacles:__ Some rules may reference low obstacles. A low obstacle is one that is 1" or less in height.

## Cover
Units in cover gain a bonus to their Save depending on the level of cover.
### Soft Cover
Units in Soft Cover gain +1 to their Save rolls.
### Hard Cover
Units in Hard Cover gain +2 to their Save rolls.
### Fortified Cover
Units in Hard Cover gain +3 to their Save rolls.
### Negative Cover
Units in Negative Cover suffer -1 to their Save rolls.
## Ground Types
Certain sections of the table may be designated to have different movement effects such as the ones below.
### Difficult Ground
Units performing a Move action that crosses difficult ground must take an Initative test. If failed, that unit lose 2" of movement for that action.
### Roads
Units that start and end a Move action on a road gain +2" of movement for that action.

## Enclosed Buildings
For the sake of simplicity and to avoid too many fiddly rules situations, units inside enclosed buildings are said to be occupying the entire floor of a building. There are no restrictions on what models can shoot out of a building based on what windows or doors may exist. Units inside buildings with fixed arcs must specify which side of the building they are facing in order to work out where the arc is coming from.
### Entering/Exiting
Units may enter a solid building’s first floor if all models in a unit end their move within 6” of it. They may leave the building or change floors of a building with a Movement action.
### Capacity
Players should decide on the model capacity of buildings before the game, but by default, they may hold 12 models per floor.
## Area Terrain
To represent terrain that covers an area rather than a specific location such as a forest, field of crops, or a ruined building, players may choose to play the terrain as "area terrain". Models whose bases overlap or are fully inside of area terrain are affected by the terrain instead of just those behind it.
### Line of Sight
Players should agree on whether or not area terrain can be seen through or just into (and out of). Terrain such as dense woods could potentially block line of sight except for units inside. 

# Powers
Certain units in the game have access to call upon special powers. Special rules assigned to these units will note how many powers these units can use and how many they may attempt to prevent from being used. Powers that are available to use can be found in a faction's roster.
## Using Powers
To cast Powers, a unit must perform a special action called the Power action. Then for each power the unit attemps to use, roll a D10 and add the unit's current Shock count. If the result is equal to or less than the power's cast value it is successful. On a roll of a 10, that unit immediately gains 2 Shock. A unit may only successfully cast each power once per turn. If this model is locked in Melee, it may only target units in the combat. It may not otherwise target enemy units in melee with friendly units.
## Stopping Powers
A model may attempt to stop a Power being used within 24\". To do so, roll a D10 and if the value is equal to or lower than the rolled value for the test, the power is stopped.
## Power Specialties
Some powers are arranged into specialties. These are groups of powers that fit a certain theme and are learned together. Before the game, a unit with the ability to use Powers may pick one specialty from which they can cast any Powers throughout the game. Units may always cast Powers that are listed as having no specialty as they are available to all casters regardless of the specialty.
# Force Building
For a full game, the following force building restrictions apply. For casual or beginner games, feel free to simply pay the points for any units you wish to bring and ignore force building restrictions.
## Points Limit
Players should agree on a Points limit before constructing lists. This can be anywhere from 500-3000+ depending on game time requirements and model availability.
For standard games we recommend 1000 points.
## Under Points Limit
Players with lists totaling less than the agreed point limit have a better chance of winning the initiative. For each 5 points under the points limit a player is, that player earns one advantage point. When taking initative rolls or rolling for mission setup, the player with the most advantage points automatically wins any ties. If no player has any advantage points, scenarios continue as normal.
## Strategy Points
Strategy points are a way to add extra flavor by providing limited-used extra abilities. In addition, most game modules allow some dice to be re-rolled to smooth out some match-defining dice rolls.
### Gaining Strategy Points
Players gain strategy points at the beginning of each game round. This is your pool of strategy points available for the round which may be spent on a variety of game effects depending on the game setting. A player always gains at least 1 strategy point per round. Some abilities or effects may allow a player to gain additional strategy points. Only one strategy point per round may be gained per round by unit or faction abilities, even if multiple effects allow a player to gain strategy points. At the end of a round, players discard any remaining strategy points meaning they do not carry over from round to round.

### Strategy Point Counts
The amount of strategy points players gain per round is dependent on the game size and how many force organizations a player fills out. Players gain a base of 1 strategy points per round, and an additional 1 per 500 points played.

__For Example:__ We are playing a 1000 point game, so I would gain 1 base, and 1000/500 = 2 additional strategy points per round. If we are playing a 500 point game, we would get 1 base, and 500/500 = 1 additional strategy point per round.
### Spending Strategy Points
Each strategy will specify when it may be used. This can include when a unit is targeted by an attack, when a unit is activated, and many more. A unit may only be the target of one strategy per action it takes (Move, Shoot, Focus etc).

### Pre-game Strategies
Some strategies are used before the game begins. You may spend strategy points from your first-round strategy point income to activate these strategies. Note however, those points will be unavailable for the first game round.

## Legends
Legends are particularly memorable people or weapons. They typically replace or upgrade a unit with a unique ability which cannot be acquired elsewhere.

### Purchasing a Legend
Legends may be purchased using list building points and have a limit to how many may be taken. Typically they will replace an item or unit, or give a unit additional abilities. Players make take one legend per 500 game points being played. For games under 500 points, players may each simply take one legend. Each legend also may only be taken once in a list.

__For Example:__ We are playing a 1000 point game, and 1000/500 = 2 allowed legends. If we are playing a 500 point game, I am allowed to take 1 legend.

### Force Organizations
Game modules and sometimes game factions each specify restrictions on the number of each type of unit that can be used. First, choose a Force Organization and note down its Strategy Point cost (listed next to its name) in order to bring that organization. Stronger or sometimes larger forces may require spending more of your strategy points. The total number of strategy points paid for force organizations are subtracted from your strategy point income each round. A list may include any number of Force Organizations, so long as your strategy points do not go below zero.
### Allied Forces
Some game modules may group factions into allied groups. In this case, you may bring a separate Force Organization (paying its strategy point cost) to include an allied faction in your Force. Factions that are in the "Unaligned" category do not have allies and may not take allied detachments. Factions in the "Mercenaries" category may be allied to any faction.
## Force Focus
Focuses are limited or focused version of a specific faction with certain benefits representing a sub-faction of a standard faction. Any force can choose a focus to unlock additional list building opportunities.
### Focus Advantages
Choosing a focus typically unlocks specific strategies for that force, but may come with some trade-offs such as limiting the amount of units you can pick while allowing you access to more powerful versions of specific units. There is no cost for picking a focus other than these potential trade-offs.

# Scenarios
The following section describes all rules common to every scenario. For specific scenarios, visit the scenario tab of the game module you're playing or the scenario generator to generate a random scenario.

## Objectives
Players control objectives if they end the turn within 3" the most models on the objective. Models with Wounds(x) count as X models instead of just one model for objective control. Once controlled, control is maintained until it is later contested or captured by an enemy unit. If there are equal numbers of enemy and friendly units within 3" of an objective, both players lose control of the objective.

## Victory Points (VP)
Victory points are the primary way to win scenarios. Players score victory points as described in the scenario and the player with the most victory points at the end of the game is the winner.

## Scenario Length
All scenarios are complete at the end of game round 6. At that point, players add up the number of victory points they have scored and a winner is determined.

## Reserves and Transports
Before deployment, any units in reserve such as ambush, outflanking or other and units inside transports are set aside and not deployed during that phase. Players may choose any units to be left in reserves as long as that player has a reserves table edge marked in the scenario. When activating a unit in reserves, if it is not yet on the table (or does not arrive via a special rule), it may enter on a designated reinforcement edge. It must first perform a Move action from the table edge to arrive, but then may complete any action.

### Ambush
Any round after the first, when this unit is activated while in reserves, you may choose a point on the battlefield 12" away from any enemy units and take an Initiative check. If passed, place the unit at that location on the location. If failed, use D10 scattering to determine the landing location of the unit relative to the chosen point. If scattering would put the unit off the table, put the unit on the table edge as close as possible to the scatter location.

### Outflanking
Any round after the first, when this unit is activated, it may be set up within 6" of a table edge that is not in the enemy deployment zone, and more than 12" from any enemy units.

## Deployment
Players roll off to determine which deployment zone will be theirs. The player who wins the roll-off must place the first unit. Players then alternate placing units in their deployment zone until all have been placed.

# Multiplayer Games
The following multiplayer rules are intended to allow players to play on "teams" against one another and to speed up game play while retaining the proper game balance.

## Free-for-all
Free-for-all games are played very similarly to one-on-one games in that each player bids to gain initiative. All players still bid and in order of the highest bid, take the highest bid and subtract the next highest bid. Each player may activate that many units in bidding order. If there are any ties players roll-off to determine who will go first.

__For Example:__ There are three players. Player one bids 5, player two bids 3 and player three bids 1. Player one will activate 5 - 3 = 2 units first. Then player two would then activate 3 - 1 = 2 units. Finally, player three would activate one unit. Play then continues in the same order with each player activating one unit until all units are activated.

## Team Games
When playing team games, both team-mates will add their bids together for the purposes of determining the first team to activate. Then, both totals are compared to determine the number of activations the highest bidding team can activate. Each player then individually assigns shock to their own units. When activating units, each player on the team will activate one unit, or in the case of imbalanced teams, the players on the smaller team together may activate a number of units equal to the larger team's size.

__For Example:__ There are two teams of two players each. Team one bids 5 and 3 making a total bid of 8. Team two bids 3 and 4 making a total bid of 7. Team one may activate one unit per player before their opponents.

# Game Tokens
The following is a set of tokens designed to track the actions and objectives in your games. If you need a custom set, feel free to come by the [Discord](https://discord.gg/M9sets4) page and we can help out.
[Token Set](/data/Battle_Forged_Tokens.pdf)
