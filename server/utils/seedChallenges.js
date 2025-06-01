const { db, admin } = require('../config/firebase');

const challenges = [
  {
    title: "Pride – Hubris Hall",
    description: "Theme: Ego, illusion of complexity, deception in simplicity.\n\nClue 1: Binary Illusion Puzzle\nA binary string (01001000 01110101 01100010 01110010 01101001 01110011) converts to “Hubris” in ASCII.\n\nClue 2: Code Mirror\nPresent a Python snippet that gives a wrong output unless mirrored.\n\nQuestion:\ndef unlock_code():\n  code = \"edoc_eruces_eht_si_siht\"\n  print(\"Secret Code:\", code)\nunlock_code()\n\nAnswer: \"this_is_the_secure_code\"",
    difficulty: "medium",
    type: "python",
    points: 30,
    initialCode: "def unlock_code():\n    code = \"edoc_eruces_eht_si_siht\"\n    # Your code here to reverse the string and print\n    pass\n\nunlock_code()",
    testCases: [
      { input: "", output: "Secret Code: this_is_the_secure_code" }
    ],
    hint: "Reverse the string before printing.",
    solution: "def unlock_code():\n    code = \"edoc_eruces_eht_si_siht\"\n    print(\"Secret Code:\", code[::-1])\nunlock_code()"
  },
  {
    title: "Greed – Golden Grotto",
    description: "Theme: Overreach, false abundance, traps behind apparent rewards.\n\nClue 3: Bitmask Safe Lock\nCalculate the bitmask using clues like: “The treasure lies in the bits of 13 & 25.”\n\nAnswer: 1101 & 11001 = 00001 → unlocks the safe.\n\nClue 4: Virtual Coin Weighing\nSimulate the classic 9-coin problem in 3 weighings using drag-and-drop balances.\n\nQuestion: Find the index of the fake coin using exactly 3 weighings.",
    difficulty: "hard",
    type: "python",
    points: 50,
    initialCode: "def weigh(group1, group2):\n    # Your code here\n    pass\n\ndef find_fake_coin(coins):\n    # Your code here\n    pass",
    testCases: [
      { input: "[10,10,10,10,10,10,10,10,9]", output: "8" }
    ],
    hint: "Use divide and conquer approach with 3 weighings.",
    solution: "def weigh(group1, group2):\n    sum1 = sum(group1)\n    sum2 = sum(group2)\n    if sum1 < sum2:\n        return -1\n    elif sum1 > sum2:\n        return 1\n    else:\n        return 0\n\ndef find_fake_coin(coins):\n    result = weigh(coins[0:3], coins[3:6])\n    if result == 0:\n        result = weigh([coins[6]], [coins[7]])\n        if result == 0:\n            return 8\n        elif result == -1:\n            return 6\n        else:\n            return 7\n    elif result == -1:\n        result = weigh([coins[0]], [coins[1]])\n        if result == 0:\n            return 2\n        elif result == -1:\n            return 0\n        else:\n            return 1\n    else:\n        result = weigh([coins[3]], [coins[4]])\n        if result == 0:\n            return 5\n        elif result == -1:\n            return 3\n        else:\n            return 4"
  },
  {
    title: "Lust – Velvet Mirage",
    description: "Theme: Sensory overload, beauty as a distraction, chasing illusions.\n\nClue 5: HEX-RGB Puzzle\nDecode the true meaning of color through its HEX value, not its label.\n\nQuestion: Decode #FF69B4\nAnswer: Hot Pink",
    difficulty: "medium",
    type: "web",
    points: 30,
    initialCode: "<!-- Your code here to display color swatches and decode HEX -->",
    testCases: [],
    hint: "Focus on HEX codes, not labels.",
    solution: "Hot Pink"
  },
  {
    title: "Envy – Emerald Reflection",
    description: "Theme: Comparison, reflection, misleading symmetry.\n\nClue 7: Mirror Maze Logic Puzzle\n\nClue 8: QR Fragment Alignment\nRearrange and rotate QR code fragments to scan the full code.\n\nAnswer:\nTop-Left: A (rotate 270°)\nTop-Right: D (rotate 90°)\nBottom-Left: C (no rotation)\nBottom-Right: B (rotate 180°)",
    difficulty: "hard",
    type: "web",
    points: 40,
    initialCode: "<!-- Your code here to implement QR fragment alignment -->",
    testCases: [],
    hint: "Arrange and rotate QR fragments correctly.",
    solution: "Top-Left: A (270°), Top-Right: D (90°), Bottom-Left: C (0°), Bottom-Right: B (180°)"
  }
];

async function seedChallenges() {
  try {
    for (const challenge of challenges) {
      const docRef = db.collection('challenges').doc();
      await docRef.set({
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        type: challenge.type,
        points: challenge.points,
        initialCode: challenge.initialCode,
        testCases: challenge.testCases,
        hint: challenge.hint,
        solution: challenge.solution,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Seeded challenge: ${challenge.title}`);
    }
    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding challenges:', error);
    process.exit(1);
  }
}

seedChallenges();
