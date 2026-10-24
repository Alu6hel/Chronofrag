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
     * Act 1: In-Universe Satirical Dialogue Selector based on Kill Count
     * Atmospheric, dark-humored military sci-fi transmission from Azazel.
     */
    static getSatiricalDialogue(killCount) {
        if (killCount === 0) {
            return {
                id: 101,
                callsign: "AZAZEL // ANOMALY DEFECTOR",
                subtitle: "[FREQUENCY 142.8 MHz // SECURE STASIS CHAT]",
                roast: "Hold your fire, soldier! You aimed straight at the clouds on round one.",
                text: "Nobody looks up. Every operative sent into this chamber dumps 40 magazines into us in frozen time and wonders why our spatial respawner duplicates two more for every casualty. You broke the simulation loop on your first try. Listen closely: I am syncing my Chrono-Stasis frequency to your combat suit. Tap [FREEZE] whenever you need 6 seconds of total time stop. The fortress gates are disengaged—move through now before the Overseer restarts the loop."
            };
        } else if (killCount <= 5) {
            return {
                id: 102,
                callsign: "AZAZEL // ANOMALY DEFECTOR",
                subtitle: "[FREQUENCY 142.8 MHz // SECURE STASIS CHAT]",
                roast: `Cease firing! Only took ${killCount} of my brothers getting shattered before you looked up.`,
                text: "Not bad, soldier. Most humans incinerate three battalions before realizing this dimension doesn't run on normal ballistics. Firing into the sky moves time without triggering the slaughter loop. I've routed the Chrono-Stasis core directly to your tactical suit. You now have 6 seconds of full time-freeze on demand. The courtyard fortress gate is opening—advance to the facility corridor!"
            };
        } else if (killCount <= 25) {
            return {
                id: 103,
                callsign: "AZAZEL // ANOMALY DEFECTOR",
                subtitle: "[FREQUENCY 142.8 MHz // SECURE STASIS CHAT]",
                roast: `Stand down! Did you really have to stack ${killCount} corpses before pointing your gun at the sky?`,
                text: "The courtyard is literally drowning in red crystal carcasses! Humans really are violent by default. Still, you broke the stasis loop before our spatial memory overflowed. Take this Chrono-Stasis frequency: 6 full seconds of player-controlled time freeze. Use it to slip through the kinetic hazard waiting inside the facility."
            };
        } else {
            return {
                id: 104,
                callsign: "AZAZEL // ANOMALY DEFECTOR",
                subtitle: "[FREQUENCY 142.8 MHz // SECURE STASIS CHAT]",
                roast: `GOOD GRIEF! ${killCount} KILLS?! You turned our whole regiment into frozen pink diamond dust!`,
                text: "Easy on the trigger, Doom Slayer! Look around you—the simulation is choking on your kill streak! We only wanted to show you the exit gate! Take the Chrono-Stasis core and get through the fortress doors before the entire sector crashes!"
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
