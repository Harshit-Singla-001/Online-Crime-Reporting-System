const WORDS_POOL = [
  'apple', 'tiger', 'moon', 'glass', 'river', 'stone', 'light', 'paper', 'green', 'chair',
  'ocean', 'forest', 'mountain', 'breeze', 'cloud', 'shadow', 'desert', 'bridge', 'castle', 'candle',
  'window', 'mirror', 'guitar', 'garden', 'camera', 'silver', 'copper', 'golden', 'winter', 'summer',
  'autumn', 'spring', 'planet', 'meteor', 'galaxy', 'rocket', 'shield', 'helmet', 'ladder', 'anchor',
  'button', 'compass', 'feather', 'hammer', 'needle', 'pencil', 'valley', 'canyon', 'island', 'harbor'
];

/**
 * Generates 10 random words from the pool.
 * @returns {string[]} Array of 10 unique random words.
 */
const generateRecoveryWords = () => {
  const words = [];
  const poolCopy = [...WORDS_POOL];
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * poolCopy.length);
    words.push(poolCopy.splice(randomIndex, 1)[0]);
  }
  return words;
};

module.exports = {
  generateRecoveryWords,
  WORDS_POOL
};
