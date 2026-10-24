/**
 * Chronofrag Touch & Hardware Input Controller
 * Supports dual virtual touch joysticks (movement + look) and keyboard/mouse fallback.
 */
class ChronoInput {
    constructor() {
        this.moveVector = { x: 0, y: 0 };
        this.lookDelta = { x: 0, y: 0 };
        this.isFiring = false;
        this.pendingFire = false;
        this.isADS = false;
        this.wantsReload = false;
        this.wantsTimeFreeze = false;
        this.wantsKineticPower = false;
        this.selectedWeaponIndex = 0; // 0: Pistols, 1: Assault Rifle, 2: Cannon

        // Joystick touch state
        this.joystickTouchId = null;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickRadius = 60;

        // Look touch state
        this.lookTouchId = null;
        this.lastLookTouch = { x: 0, y: 0 };

        // Desktop keyboard state
        this.keys = {};
        this.isPointerLocked = false;
        this.sensitivity = 0.0022;

        this.init();
    }

    init() {
        this.setupTouchControls();
        this.setupActionButtons();
        this.setupDesktopFallback();
    }

    setupTouchControls() {
        const joystickZone = document.getElementById('joystick-zone');
        const joystickKnob = document.getElementById('joystick-knob');
        const lookZone = document.getElementById('look-zone');

        if (!joystickZone || !lookZone) return;

        // --- JOYSTICK TOUCH HANDLING ---
        const handleJoystickStart = (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (this.joystickTouchId === null) {
                    this.joystickTouchId = touch.identifier;
                    const rect = joystickZone.getBoundingClientRect();
                    this.joystickCenter = {
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    };
                    this.updateJoystick(touch.clientX, touch.clientY);
                    break;
                }
            }
        };

        const handleJoystickMove = (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.joystickTouchId) {
                    this.updateJoystick(touch.clientX, touch.clientY);
                    break;
                }
            }
        };

        const handleJoystickEnd = (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.joystickTouchId) {
                    this.joystickTouchId = null;
                    this.moveVector = { x: 0, y: 0 };
                    if (joystickKnob) {
                        joystickKnob.style.transform = `translate(0px, 0px)`;
                    }
                    break;
                }
            }
        };

        joystickZone.addEventListener('touchstart', handleJoystickStart, { passive: false });
        window.addEventListener('touchmove', handleJoystickMove, { passive: false });
        window.addEventListener('touchend', handleJoystickEnd, { passive: false });
        window.addEventListener('touchcancel', handleJoystickEnd, { passive: false });

        // --- LOOK TOUCH ZONE HANDLING ---
        const handleLookStart = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (this.lookTouchId === null && touch.clientX > window.innerWidth * 0.4) {
                    this.lookTouchId = touch.identifier;
                    this.lastLookTouch = { x: touch.clientX, y: touch.clientY };
                    break;
                }
            }
        };

        const handleLookMove = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.lookTouchId) {
                    const dx = touch.clientX - this.lastLookTouch.x;
                    const dy = touch.clientY - this.lastLookTouch.y;
                    const sensMultiplier = this.isADS ? 0.45 : 1.0;
                    this.lookDelta.x += dx * this.sensitivity * sensMultiplier;
                    this.lookDelta.y += dy * this.sensitivity * sensMultiplier;
                    this.lastLookTouch = { x: touch.clientX, y: touch.clientY };
                    break;
                }
            }
        };

        const handleLookEnd = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.lookTouchId) {
                    this.lookTouchId = null;
                    break;
                }
            }
        };

        lookZone.addEventListener('touchstart', handleLookStart, { passive: true });
        window.addEventListener('touchmove', handleLookMove, { passive: true });
        window.addEventListener('touchend', handleLookEnd, { passive: true });
        window.addEventListener('touchcancel', handleLookEnd, { passive: true });
    }

    updateJoystick(touchX, touchY) {
        const dx = touchX - this.joystickCenter.x;
        const dy = touchY - this.joystickCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clampedDist = Math.min(dist, this.joystickRadius);
        const angle = Math.atan2(dy, dx);

        const clampedX = Math.cos(angle) * clampedDist;
        const clampedY = Math.sin(angle) * clampedDist;

        const joystickKnob = document.getElementById('joystick-knob');
        if (joystickKnob) {
            joystickKnob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        }

        // Normalize between -1.0 and 1.0
        this.moveVector.x = clampedX / this.joystickRadius;
        this.moveVector.y = clampedY / this.joystickRadius;
    }

    setupActionButtons() {
        const btnShoot = document.getElementById('btn-shoot');
        const btnAds = document.getElementById('btn-ads');
        const btnReload = document.getElementById('btn-reload');
        const btnFreeze = document.getElementById('btn-power-freeze');
        const btnKinetic = document.getElementById('btn-power-kinetic');

        // Shoot Button (Touch + Mouse + Click)
        if (btnShoot) {
            const startShoot = (e) => {
                if (e.cancelable) e.preventDefault();
                this.isFiring = true;
                this.pendingFire = true;
                btnShoot.classList.add('pressed');
            };
            const endShoot = (e) => {
                if (e.cancelable) e.preventDefault();
                this.isFiring = false;
                btnShoot.classList.remove('pressed');
            };

            btnShoot.addEventListener('touchstart', startShoot, { passive: false });
            btnShoot.addEventListener('touchend', endShoot, { passive: false });
            btnShoot.addEventListener('mousedown', startShoot);
            btnShoot.addEventListener('mouseup', endShoot);
            btnShoot.addEventListener('click', (e) => {
                this.pendingFire = true;
            });
        }

        // ADS Toggle
        if (btnAds) {
            const toggleADS = (e) => {
                e.preventDefault();
                this.isADS = !this.isADS;
                btnAds.classList.toggle('pressed', this.isADS);
            };
            btnAds.addEventListener('touchstart', toggleADS, { passive: false });
            btnAds.addEventListener('click', toggleADS);
        }

        // Reload Button
        if (btnReload) {
            btnReload.addEventListener('click', () => { this.wantsReload = true; });
            btnReload.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.wantsReload = true;
            }, { passive: false });
        }

        // Powers
        if (btnFreeze) {
            btnFreeze.addEventListener('click', () => { this.wantsTimeFreeze = true; });
            btnFreeze.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.wantsTimeFreeze = true;
            }, { passive: false });
        }

        if (btnKinetic) {
            btnKinetic.addEventListener('click', () => { this.wantsKineticPower = true; });
            btnKinetic.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.wantsKineticPower = true;
            }, { passive: false });
        }

        // Weapon Slot switching
        const weaponSlots = document.querySelectorAll('.weapon-slot');
        weaponSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => this.selectWeapon(index));
            slot.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.selectWeapon(index);
            }, { passive: false });
        });
    }

    selectWeapon(index) {
        this.selectedWeaponIndex = index;
        const slots = document.querySelectorAll('.weapon-slot');
        slots.forEach((s, i) => s.classList.toggle('active', i === index));
    }

    setupDesktopFallback() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyR') this.wantsReload = true;
            if (e.code === 'Space') this.wantsTimeFreeze = true;
            if (e.code === 'KeyE') this.wantsKineticPower = true;
            if (e.code === 'Digit1') this.selectWeapon(0);
            if (e.code === 'Digit2') this.selectWeapon(1);
            if (e.code === 'Digit3') this.selectWeapon(2);
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.addEventListener('click', () => {
                if (!this.isPointerLocked && document.pointerLockElement !== canvas) {
                    canvas.requestPointerLock?.();
                }
            });

            document.addEventListener('pointerlockchange', () => {
                this.isPointerLocked = (document.pointerLockElement === canvas);
            });

            window.addEventListener('mousemove', (e) => {
                if (this.isPointerLocked) {
                    const sensMultiplier = this.isADS ? 0.45 : 1.0;
                    this.lookDelta.x += e.movementX * this.sensitivity * sensMultiplier;
                    this.lookDelta.y += e.movementY * this.sensitivity * sensMultiplier;
                }
            });

            window.addEventListener('mousedown', (e) => {
                if (this.isPointerLocked) {
                    if (e.button === 0) this.isFiring = true;
                    if (e.button === 2) this.isADS = true;
                }
            });

            window.addEventListener('mouseup', (e) => {
                if (this.isPointerLocked) {
                    if (e.button === 0) this.isFiring = false;
                    if (e.button === 2) this.isADS = false;
                }
            });

            window.addEventListener('contextmenu', (e) => {
                if (this.isPointerLocked) e.preventDefault();
            });
        }
    }

    getMovement() {
        let mx = this.moveVector.x;
        let my = this.moveVector.y;

        // Desktop keyboard overlay
        if (this.keys['KeyW']) my -= 1.0;
        if (this.keys['KeyS']) my += 1.0;
        if (this.keys['KeyA']) mx -= 1.0;
        if (this.keys['KeyD']) mx += 1.0;

        const len = Math.sqrt(mx * mx + my * my);
        if (len > 1.0) {
            mx /= len;
            my /= len;
        }

        return { x: mx, y: my, magnitude: len };
    }

    consumeLookDelta() {
        const d = { x: this.lookDelta.x, y: this.lookDelta.y };
        this.lookDelta.x = 0;
        this.lookDelta.y = 0;
        return d;
    }
}

window.ChronoInput = ChronoInput;
