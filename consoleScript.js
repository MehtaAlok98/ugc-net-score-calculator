// Answer Key (Correct Answers) - Modify as needed
const answerKey = {
  // Paste here
};

// Class representing a student
class Student {
  constructor(name, applicationNo, rollNo, testDate, subject) {
    this.name = name;
    this.applicationNo = applicationNo;
    this.rollNo = rollNo;
    this.testDate = testDate;
    this.subject = subject;
  }

  getDetails() {
    return `Student Details:\nName: ${this.name}\nApplication No: ${this.applicationNo}\nRoll No: ${this.rollNo}\nTest Date: ${this.testDate}\nSubject: ${this.subject}`;
  }
}

// Class representing a section with questions and chosen options
class Section {
  constructor(name) {
    this.name = name;
    this.questions = [];
  }

  addQuestion(questionId, correctAnswer, chosenAnswer) {
    this.questions.push({ questionId, correctAnswer, chosenAnswer });
  }

  calculateScore() {
    return this.questions.reduce(
      (score, q) =>
        q.correctAnswer === q.chosenAnswer || q.correctAnswer === 0
          ? score + 2
          : score,
      0
    );
  }

  totalMarks() {
    return this.questions.length * 2; // Each question carries 2 marks
  }
}

// Class responsible for evaluating the quiz
class QuizEvaluator {
  constructor(student) {
    this.student = student;
    this.sections = new Map();
  }

  addQuestionToSection(sectionName, questionId, correctAnswer, chosenAnswer) {
    if (!this.sections.has(sectionName)) {
      this.sections.set(sectionName, new Section(sectionName));
    }
    this.sections
      .get(sectionName)
      .addQuestion(questionId, correctAnswer, chosenAnswer);
  }

  generateReport() {
    let report = `${this.student.getDetails()}\n\nSection-wise Scores:\n`;
    let totalScore = 0;
    let totalMarks = 0;

    this.sections.forEach((section, name) => {
      const sectionScore = section.calculateScore();
      const sectionTotal = section.totalMarks();
      totalScore += sectionScore;
      totalMarks += sectionTotal;
      report += `Section: ${name}, Score: ${sectionScore}/${sectionTotal}\n`;
    });

    report += `\nTotal Score: ${totalScore}/${totalMarks}`;
    return report;
  }
}

// Function to extract student details from the webpage
function extractStudentDetails() {
  console.log("Extracting student details...");
  const rows = document.querySelectorAll(".main-info-pnl table tr");
  const details = {};

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length === 2) {
      const key = cells[0].textContent.trim();
      const value = cells[1].textContent.trim();
      details[key] = value;
    }
  });

  return new Student(
    details["Candidate Name"],
    details["Application No"],
    details["Roll No."],
    details["Test Date"],
    details["Subject"]
  );
}

// Function to extract student answers from the webpage
function extractStudentAnswers() {
  console.log("Extracting student answers...");
  const answers = {};

  document.querySelectorAll(".menu-tbl").forEach((table) => {
    const questionId = parseInt(
      table.querySelector("tr:nth-child(2) td:nth-child(2)").textContent.trim(),
      10
    );
    const chosenAnswer = parseInt(
      table.querySelector("tr:nth-child(8) td:nth-child(2)").textContent.trim(),
      10
    );
    if (!isNaN(questionId) && !isNaN(chosenAnswer)) {
      answers[questionId] = chosenAnswer;
    }
  });

  return answers;
}

// Function to copy text to clipboard
function copyToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

// Main Execution
console.log("Initializing evaluator...");
const student = extractStudentDetails();
const evaluator = new QuizEvaluator(student);
const studentAnswers = extractStudentAnswers();

if (Object.keys(answerKey).length === 0) {
  console.warn("Answer key is empty. No evaluation will be performed.");
} else {
  document.querySelectorAll(".section-cntnr").forEach((section) => {
    const sectionName = section
      .querySelector(".section-lbl .bold")
      .textContent.trim();

    section.querySelectorAll(".menu-tbl").forEach((table) => {
      const questionId = parseInt(
        table
          .querySelector("tr:nth-child(2) td:nth-child(2)")
          .textContent.trim(),
        10
      );
      const chosenAnswer = studentAnswers[questionId] || 0;
      const correctAnswer = answerKey[questionId] || 0;

      evaluator.addQuestionToSection(
        sectionName,
        questionId,
        correctAnswer,
        chosenAnswer
      );
    });
  });

  // Generate report and copy to clipboard
  const report = evaluator.generateReport();
  console.log(report);
  copyToClipboard(report);
}
