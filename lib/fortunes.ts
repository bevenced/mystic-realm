/**
 * Pre-written daily fortunes — 100+ mystical one-liners.
 * Picked randomly each day to avoid AI API cost on check-in.
 */

const FORTUNES = [
  "The stars whisper of an unexpected opportunity approaching from the east.",
  "A gentle wind carries the answer you've been seeking. Listen closely.",
  "Today the moon aligns with your heart's deepest desire. Trust your emotions.",
  "Patience is your superpower this week. The universe is arranging things behind the scenes.",
  "Someone from your past holds a key to your future. Stay open to reconnection.",
  "The challenges you face now are sculpting your character. Embrace the chisel.",
  "Your intuition is sharper than usual today. Act on your first instinct.",
  "A creative breakthrough is simmering just below the surface. Give it space.",
  "The number 7 appears as a sign — completion and new beginnings intertwine.",
  "Your energy is magnetic right now. People are drawn to your authentic self.",
  "Let go of what no longer serves you. The empty space will fill with magic.",
  "A message is traveling toward you. Watch for signs in unexpected places.",
  "Today you stand at a crossroads. Both paths lead to growth — choose with courage.",
  "The element of water guides you today: be fluid, adaptable, and quietly powerful.",
  "Rest is not weakness. Even the moon needs time to renew its light.",
  "An old wound is ready to heal. Give yourself permission to release it.",
  "Your words carry extra weight today. Speak with intention and kindness.",
  "The universe is testing your patience to see how badly you want it. Hold steady.",
  "A stranger will say something that changes your perspective. Stay present.",
  "Today's luck favors the bold. That thing you've been hesitating on? Do it.",
  "The ancestors walk beside you today. You are never truly alone.",
  "Something you lost is finding its way back — not as it was, but as it should be.",
  "Your dreams last night carried prophetic energy. Write them down before they fade.",
  "The color gold surrounds your aura today. Abundance is near.",
  "A cycle is completing. Honor what was, and bless what is to come.",
  "The earth element grounds you today. Spend time in nature if you can.",
  "Someone is thinking of you with great affection right now.",
  "Your hidden talents are about to be revealed. Stay ready.",
  "The wind carries change — not to disrupt, but to redirect you toward alignment.",
  "Today you are exactly where you need to be. Trust the timing of your life.",
  "A lesson you learned years ago will prove invaluable today.",
  "The fire element ignites your ambition. Channel it wisely.",
  "An unexpected compliment will brighten your day and shift your perspective.",
  "Your inner child has wisdom for you today. Do something playful.",
  "The veil between worlds is thin. Pay attention to synchronicities.",
  "A financial opportunity presents itself in disguise. Look beyond the surface.",
  "Your heart knows the way. The mind's job is simply to follow.",
  "Today the sun illuminates a blind spot. See it as a gift, not a flaw.",
  "Someone nearby needs your kindness more than they show. Be generous.",
  "The rhythm of the ocean lives in your pulse. Breathe with intention.",
  "A door is closing, but three more are opening. Focus forward.",
  "Your resilience is being celebrated by forces you cannot see.",
  "The number 3 brings creative energy. Start something new today.",
  "A truth you've been avoiding is ready to be faced. You are stronger than you know.",
  "Today is a day for gratitude. Count your blessings and watch them multiply.",
  "The mountain ahead looks steep, but you've climbed higher before.",
  "Your unique perspective is needed in a conversation today. Share it.",
  "An animal crossing your path today carries a message. Notice it.",
  "The cosmic clock is striking a new hour. A fresh chapter begins.",
  "Your sensitivity is not a weakness — it is your greatest gift. Honor it.",
  "The stars align to support a difficult conversation. Speak your truth gently.",
  "A piece of advice from a elder holds the solution you seek.",
  "Today the universe asks you to surrender control. Let things unfold naturally.",
  "Your creative well is full. Make something, anything, with your hands.",
  "A relationship enters a new phase. Growth requires honest communication.",
  "The moon's energy heightens your emotional awareness. Journal your feelings.",
  "Luck finds those who are already in motion. Take the first step.",
  "Your laughter is healing — for yourself and for those around you. Use it freely.",
  "The path of least resistance is not laziness, it is wisdom. Flow downstream.",
  "Today you will receive exactly what you need, though not what you expect.",
  "A forgotten skill is about to become useful again. Dust it off.",
  "Your guardian energy is strong today. You are protected.",
  "The element of air clears mental fog. Take three deep breaths.",
  "Someone's kindness today will restore your faith in human goodness.",
  "Your roots go deeper than you know. Draw strength from where you came from.",
  "A small act of courage today will ripple outward in ways you cannot imagine.",
  "The universe is conspiring in your favor, even when it doesn't feel like it.",
  "Today's challenge is tomorrow's testimony. Keep going.",
  "Your voice matters in a decision being made today. Speak up.",
  "The sacred pause between inhalation and exhalation holds your answer.",
  "An insight arrives when you stop searching for it. Let your mind wander.",
  "Your body is wiser than your anxious thoughts today. Listen to it.",
  "The number 11 represents spiritual awakening. Pay attention to recurring numbers.",
  "A friendship is about to deepen. Be vulnerable enough to let it.",
  "Today you are a lighthouse — steady, bright, guiding others home.",
  "The seeds you planted weeks ago are germinating. Growth is happening unseen.",
  "Your unique path doesn't need to make sense to anyone else. Walk it proudly.",
  "The universe sends you a mirror today. See yourself with compassionate eyes.",
  "An old habit is ready to be released. You've outgrown it.",
  "Today brings a test of integrity. Your character will guide you through.",
  "The warmth you give to others returns to you multiplied. Stay open-hearted.",
  "A moment of silence will reveal more than hours of noise. Meditate.",
  "Your capacity for joy expands when you stop comparing your journey.",
  "The element of spirit surrounds you. You are connected to all that is.",
  "A breakthrough in understanding is near. Keep asking questions.",
  "Today the ancestors remind you: you come from a lineage of survivors.",
  "Your natural charisma is amplified. Use it to uplift, not just to shine.",
  "The right words will arrive exactly when you need them. Trust the pause.",
  "Something you've been putting off holds unexpected gifts. Begin today.",
  "Your shadow side has wisdom too. Integrate, don't reject.",
  "Today is a bridge between where you've been and where you're going. Cross it.",
  "The cosmic weather is clearing. Clarity arrives by sunset.",
  "A childhood dream stirs within you. It's not too late.",
  "Your kindness to a stranger today will echo in eternity.",
  "The starlight that touches your skin tonight carries ancient blessings.",
  "You are the answer to someone's prayer. Show up fully.",
  "An unexpected detour leads to a beautiful destination. Embrace the rerouting.",
  "Your inner compass knows true north. External noise is just noise.",
  "Today the universe whispers: 'You are enough, exactly as you are.'",
  "The wheel of fortune spins in your direction. Be ready to receive.",
  "A single candle can illuminate a vast darkness. Be that light today.",
];

/**
 * Get a fortune for a specific date (deterministic — same date = same fortune).
 * Falls back to random selection if no date provided.
 */
export function getDailyFortune(date?: Date): string {
  if (!date) {
    return FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  }
  // Deterministic: use DJB2-style hash for uniform distribution across dates
  const day = date.toISOString().slice(0, 10);
  let hash = 5381;
  for (let i = 0; i < day.length; i++) {
    hash = ((hash << 5) + hash) + day.charCodeAt(i); // hash * 33 + c
  }
  const index = (hash >>> 0) % FORTUNES.length; // ensure unsigned
  return FORTUNES[index];
}

/** Total number of fortunes in the pool */
export const FORTUNE_COUNT = FORTUNES.length;
