const { db, admin } = require('../config/firebase');

const challenges = [
  {
    title: "Basic Shell Challenge",
    description: "Write a shell command to list all files in the current directory.",
    difficulty: "easy",
    type: "shell",
    points: 10,
    initialCode: "",
    testCases: [
      { input: "", output: "file1.txt\nfile2.txt\n" }
    ],
    hint: "Use the ls command.",
    solution: "ls"
  },
  {
    title: "Python Sum Function",
    description: "Write a Python function that returns the sum of two numbers.",
    difficulty: "easy",
    type: "python",
    points: 15,
    initialCode: "def sum_two_numbers(a, b):\n    # Your code here\n    pass",
    testCases: [
      { input: "1, 2", output: "3" },
      { input: "5, 7", output: "12" }
    ],
    hint: "Use the + operator.",
    solution: "def sum_two_numbers(a, b):\n    return a + b"
  },
  {
    title: "C Hello World",
    description: "Write a C program that prints 'Hello, World!' to the console.",
    difficulty: "easy",
    type: "c",
    points: 20,
    initialCode: "#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}",
    testCases: [],
    hint: "Use printf function.",
    solution: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}"
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
