/**
 * Chronofrag Alu Logic Bridge
 * Direct JavaScript implementation of the verified Z3 algorithms in `alu_core/chrono_core.alu`.
 * Ensures complete mathematical parity between the native Alu language and mobile client runtime.
 */
class AluLogicBridge {
    /**
     * Act 1: Time Dilation
     * Time only advances when gun is fired (or during active recoil ticks)
     * unless manual freeze power is active.
     */
    static calculateTimeAdvance(isFiring, recoilTicks, manualFreezeActive) {
        if (manualFreezeActive === 1 || manualFreezeActive === true) {
            return 0; // Forced manual freeze overrides everything
        }
        if (isFiring === 1 || isFiring === true) {
            return 1;
        }
        if (recoilTicks > 0) {
            return 1;
        }
        return 0;
    }

    /**
     * Act 1: Sky-Aim Detection
     * Returns true if player aims skyward (pitch >= 60 degrees)
     */
    static isSkywardShot(pitchDeg) {
        return pitchDeg >= 60;
    }

    /**
     * Act 1: Satirical Monster Dialogue Trigger
     * Shooting into the sky while monster is within talk range (< 350 units)
     */
    static canInitiateMonsterDialogue(isSkyward, isFiring, monsterDist) {
        if (isSkyward && isFiring && monsterDist < 8.0) { // Scaled to 3D world units (8 meters)
            return true;
        }
        return false;
    }

    /**
     * Act 1: Satirical Dialogue Selector based on Kill Count
     */
    static getSatiricalDialogue(killCount) {
        if (killCount === 0) {
            return {
                id: 101,
                title: "THE OMNISCIENT PACIFIST",
                roast: "Wait... you fired straight into empty air on your very first shot?!",
                text: "Are you psychic, or did you inspect the repo commit history? Either way, you're ruining my dramatic predatory entrance. We're supposed to endlessly swarm you while you panic-fire at us in frozen time! But since you broke the script, let me tell you how to actually leave this dimension."
            };
        } else if (killCount <= 5) {
            return {
                id: 102,
                title: "THE FAST LEARNER",
                roast: `Only took ${killCount} of my cousins getting turned into red ice before you looked up.`,
                text: "Not bad, human. Most players dump 80 magazines into us wondering why we keep multiplying. Every time you blast one of us, our spatial respawner clones two more. Shooting into the sky moves time without triggering the murder loop. Listen closely now: I'm transferring the Chrono-Stasis core to you."
            };
        } else if (killCount <= 25) {
            return {
                id: 103,
                title: "THE STUBBORN GLADIATOR",
                roast: `Did you really need to slaughter ${killCount} monsters in cold blood first?`,
                text: "Seriously? You stood here in frozen time vaporizing an entire squad before thinking: 'Hmm, what happens if I pull the trigger while looking at clouds?' Humans really are violent by default. Regardless, you've survived long enough to earn the manual Time-Freeze power. Use it to shatter the barrier ahead—but beware what lies beyond."
            };
        } else {
            return {
                id: 104,
                title: "THE GENOCIDAL MENACE",
                roast: `HOLY MATRIX! ${killCount} KILLS?! You turned our whole battalion into frozen pink mist!`,
                text: "Relax your trigger finger, Doom Slayer! Look around you—the floor is literally paved with our shattered remnants! We only wanted to show you the exit! Please, just take the Time-Freeze ability and proceed through the gate before there's none of us left to complain in the credits!"
            };
        }
    }

    /**
     * Act 2: Non-Newtonian Kinetic Trap
     * If character speed exceeds threshold, kinetic viscosity causes a hard STOP (velocity = 0).
     */
    static calculateKineticVelocity(targetSpeed, maxAllowedSpeed = 0.08) {
        if (targetSpeed <= maxAllowedSpeed) {
            return targetSpeed; // Allowed slow-motion glide
        }
        return 0; // Hard Kinetic Character Movement Speed Block!
    }

    /**
     * Act 3: "The Bugged" Uncanny Glitch Transform
     * Deterministic glitch jerk offset
     */
    static calculateBuggedGlitchOffset(tick, entityId) {
        const hash = (tick * 37 + entityId * 17) % 100;
        if (hash > 88) {
            return (hash - 88) * 0.04;
        }
        return 0;
    }
}

window.AluLogicBridge = AluLogicBridge;
