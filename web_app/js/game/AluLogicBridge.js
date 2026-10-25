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
                subtitle: "[FREQUENCY 142.8 MHz // SECURE STASIS COMM]",
                roast: "Hold your fire, operative! You discharged straight into the ship's ceiling on round one.",
                text: "Nobody looks up. Every mercenary dropped onto this vessel dumps 40 clips into us in frozen time and wonders why the cryo-respawner creates two more for each kill. You broke the stasis loop right away. I have calibrated my Chrono-Stasis core to your combat rig. Tap [FREEZE] for 6 seconds of true time stop. The hangar blast airlock is disengaged—advance through the conduit corridor toward the planetary surface airlock!"
            };
        } else if (killCount <= 5) {
            return {
                id: 102,
                callsign: "AZAZEL // ANOMALY DEFECTOR",
                subtitle: "[FREQUENCY 142.8 MHz // SECURE STASIS COMM]",
                roast: `Cease firing! Took ${killCount} of my squad getting pulverized before you aimed skyward.`,
                text: "Good instinct, soldier. Firing into open air moves the chronal timeline without triggering the ship's defensive clone cycle. I have routed the Chrono-Stasis frequency directly to your HUD. You now have 6.0 seconds of manual time-freeze on demand. The hangar blast gate is sliding open—navigate the ship's conduit corridor!"
            };
        } else if (killCount <= 25) {
            return {
                id: 103,
                callsign: "AZAZEL // ANOMALY DEFECTOR",
                subtitle: "[FREQUENCY 142.8 MHz // SECURE STASIS COMM]",
                roast: `Hold fire! Did you really have to stack ${killCount} cryo-corpses before looking up?`,
                text: "The hangar floor is drowning in shattered crystal shells! Still, you broke the stasis lock before the ship's mainframe crashed. Take this Chrono-Stasis frequency: 6 full seconds of player-controlled time freeze. Use it to slip through the kinetic resonance barriers in the conduit corridor!"
            };
        } else {
            return {
                id: 104,
                callsign: "AZAZEL // ANOMALY DEFECTOR",
                subtitle: "[FREQUENCY 142.8 MHz // SECURE STASIS COMM]",
                roast: `GOOD GRIEF! ${killCount} KILLS?! You turned our whole stasis detachment into frozen pink dust!`,
                text: "Easy on that neon trigger! The containment bay is literally smoking! We only wanted to show you the airlock out to the planet! Take the Chrono-Stasis core and get through the blast doors before the ship goes into emergency lockdown!"
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
