// Initial sample data and presets for StudyBuddy

const DEFAULT_DECKS = [
  {
    id: "deck-cs",
    name: "💻 Computer Science & Web",
    description: "Core concepts in programming, algorithms, and web development.",
    cards: [
      {
        id: "c1",
        question: "What is the Big-O time complexity of binary search on a sorted array?",
        answer: "O(log n) — because each comparison cuts the search space in half.",
        status: "mastered" // 'unlearned', 'review', 'mastered'
      },
      {
        id: "c2",
        question: "What is the difference between synchronous and asynchronous execution?",
        answer: "Synchronous operations execute sequentially, blocking subsequent tasks until complete. Asynchronous operations run without blocking, allowing other tasks to execute in parallel.",
        status: "review"
      },
      {
        id: "c3",
        question: "What is the Event Loop in JavaScript?",
        answer: "A single-threaded loop that continuously checks the Call Stack and Task/Microtask Queues, pushing queued callbacks to the stack when it's empty.",
        status: "unlearned"
      },
      {
        id: "c4",
        question: "What does HTTP status code 403 Forbidden indicate?",
        answer: "The server understands the request, but refuses to authorize it (unlike 401 Unauthorized, authentication will not help).",
        status: "mastered"
      },
      {
        id: "c5",
        question: "What is the primary difference between a Stack and a Queue?",
        answer: "A Stack follows LIFO (Last In, First Out), whereas a Queue follows FIFO (First In, First Out).",
        status: "unlearned"
      }
    ]
  },
  {
    id: "deck-geo",
    name: "🌍 World Geography & Capitals",
    description: "Essential world geography, countries, and iconic landmarks.",
    cards: [
      {
        id: "g1",
        question: "What is the capital city of Australia?",
        answer: "Canberra (often mistakenly thought to be Sydney or Melbourne).",
        status: "unlearned"
      },
      {
        id: "g2",
        question: "Which river is considered the longest in the world?",
        answer: "The Nile River (~6,650 km), followed closely by the Amazon River.",
        status: "mastered"
      },
      {
        id: "g3",
        question: "Which country has the most natural lakes in the world?",
        answer: "Canada — home to over 60% of all natural lakes on Earth.",
        status: "review"
      },
      {
        id: "g4",
        question: "What is the deepest oceanic trench on Earth?",
        answer: "The Mariana Trench (Challenger Deep, ~10,994 meters deep).",
        status: "unlearned"
      },
      {
        id: "g5",
        question: "What is the capital of Japan?",
        answer: "Tokyo — the most populous metropolitan area in the world.",
        status: "mastered"
      }
    ]
  },
  {
    id: "deck-science",
    name: "🔬 General Science & Biology",
    description: "Fundamentals of physics, cellular biology, and chemistry.",
    cards: [
      {
        id: "s1",
        question: "What is the powerhouse organelle of the eukaryotic cell?",
        answer: "The Mitochondria — responsible for generating most of the cell's ATP.",
        status: "mastered"
      },
      {
        id: "s2",
        question: "What is Newton's Third Law of Motion?",
        answer: "For every action, there is an equal and opposite reaction.",
        status: "review"
      },
      {
        id: "s3",
        question: "What is the chemical symbol and atomic number of Gold?",
        answer: "Symbol: Au (from Latin Aurum), Atomic Number: 79.",
        status: "unlearned"
      },
      {
        id: "s4",
        question: "What is the process by which green plants convert light energy into chemical energy?",
        answer: "Photosynthesis — using sunlight, water, and CO2 to produce glucose and oxygen.",
        status: "mastered"
      }
    ]
  }
];

const DEFAULT_CUSTOM_QUIZZES = [
  {
    id: "quiz-general-knowledge",
    title: "🧠 General Science & Tech Sprint",
    description: "A quick mixed challenge testing science, computing, and logic.",
    questions: [
      {
        id: "q1",
        question: "Which data structure follows the First-In, First-Out (FIFO) principle?",
        options: ["Stack", "Queue", "Binary Tree", "Heap"],
        correctIndex: 1,
        explanation: "Queues operate on FIFO, just like a line of people waiting."
      },
      {
        id: "q2",
        question: "What is the primary function of mitochondria in human cells?",
        options: ["Store genetic code", "Synthesize proteins", "Produce ATP energy", "Digest cell waste"],
        correctIndex: 2,
        explanation: "Mitochondria produce ATP through cellular respiration."
      },
      {
        id: "q3",
        question: "What does CSS stand for in web development?",
        options: [
          "Computer Style Sheets",
          "Cascading Style Sheets",
          "Creative Styling Software",
          "Colorful Syntax Sheets"
        ],
        correctIndex: 1,
        explanation: "CSS stands for Cascading Style Sheets."
      },
      {
        id: "q4",
        question: "Which planet in our solar system is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctIndex: 1,
        explanation: "Mars appears reddish due to iron oxide (rust) on its surface."
      },
      {
        id: "q5",
        question: "What is the average time complexity of searching a Hash Map?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        correctIndex: 0,
        explanation: "Hash maps offer constant O(1) average lookup time via hashing keys."
      }
    ]
  }
];

const DEFAULT_SETTINGS = {
  pomoTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomos: false,
  soundVolume: 0.7,
  ambientVolume: 0.15,
  dailyGoals: {
    pomodoros: 4,
    flashcards: 15,
    quizzes: 1
  }
};
