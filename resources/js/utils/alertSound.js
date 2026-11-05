// Short two-tone chime for "new ticket" / "ready" alerts on the Kitchen,
// Bar and POS screens — no audio file to host, just the Web Audio API.
export function playAlert() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const now = ctx.currentTime;
        [880, 1320].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.0001, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.15 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.15 + 0.25);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.3);
        });
    } catch {
        // Audio can fail (autoplay policy, no audio device) — alerts are a
        // convenience, never worth breaking the page over.
    }
}
