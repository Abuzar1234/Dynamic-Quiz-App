import { useEffect, useState } from "react";
import "./Quiz.css";

type Question = {
  question: string;
  options: string[];
  answer: string;
};

function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [field, setField] = useState<string>(""); // subject field
  const [input, setInput] = useState<string>(""); // instructions field
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{question: string, selected: string, correct: string}[]>([]);
  const [showFeedback, setShowFeedback] = useState<string | null>(null); // "correct" | "wrong"


  // Fetch questions after submitting input
  useEffect(() => {
    if (!submitted) return;
    console.log("This has been called ")
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // Fixed: Changed port from 5000 to 3000 to match your server
        const res = await fetch("http://localhost:3000/quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: input.trim(), // user's instructions
            field: field.trim() // user's subject field
          }),
        });
        console.log("we are here");
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.text(); // Get as text first
        //console.log("Raw response:", data); // Debug log
        
        // Try to extract JSON from the response if it's wrapped in markdown
        let jsonData = data;
        if (data.includes('```json')) {
          const jsonMatch = data.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonData = jsonMatch[1];
          }
        }
        
        console.log("are we even getting here?");
        const parsedData: Question[] = JSON.parse(jsonData);
        console.log("Parsed questions:", parsedData); // Debug log
        setQuestions(parsedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [submitted, field, input]);

  const handleOptionClick = (option: string) => setSelected(option);

  const handleNext = () => {
  const currentQuestion = questions[currentIndex];
  const isCorrect = selected === currentQuestion.answer;

  // Save answer
  setAnswers(prev => [
    ...prev,
    { question: currentQuestion.question, selected: selected!, correct: currentQuestion.answer }
  ]);

  // Show instant feedback
  setShowFeedback(isCorrect ? "correct" : "wrong");

  if (isCorrect) {
    setScore((prev) => prev + 1);
  }

  // Hide feedback after 1 second and move on
  setTimeout(() => {
    setShowFeedback(null);
    setSelected(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  }, 1000);
};


  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setCompleted(false);
    setField("");
    setInput("");
    setSubmitted(false);
    setError(null);
  };

  // Input form (before quiz starts)
  if (!submitted) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <h2 className="quiz-title">Create Your Quiz</h2>
          
          <div className="input-group">
            <label className="input-label">Subject/Field:</label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="e.g. Mathematics, Science, History"
              className="quiz-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Instructions/Requirements:</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Focus on basic algebra, Include word problems, Make it challenging"
              className="quiz-textarea"
              rows={3}
            />
          </div>

          <button
            className="next-btn"
            onClick={() => field.trim() && input.trim() && setSubmitted(true)}
            disabled={!field.trim() || !input.trim()}
          >
            Generate Quiz
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="quiz-container">
      <div className="quiz-card">
        <p>Loading questions...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="quiz-container">
      <div className="quiz-card">
        <p>Error: {error}</p>
        <button className="next-btn" onClick={resetQuiz}>
          Try Again
        </button>
      </div>
    </div>
  );

 if (completed) {
  const percentage = Math.round((score / questions.length) * 100);
  return (
    <div className="quiz-container">
      <div className="quiz-card quiz-result">
        <h2>Quiz Completed! 🎉</h2>
        <p className="quiz-score">
          Your Score: {score} / {questions.length} ({percentage}%)
        </p>

        <h3>Review</h3>
        <ul>
          {answers.map((ans, i) => (
            <li key={i}>
              <strong>Q{i + 1}:</strong> {ans.question}
              <br />
              <span style={{ color: ans.selected === ans.correct ? "green" : "red" }}>
                Your answer: {ans.selected}
              </span>
              {ans.selected !== ans.correct && (
                <span style={{ color: "green" }}> | Correct: {ans.correct}</span>
              )}
            </li>
          ))}
        </ul>

        <button className="next-btn" onClick={resetQuiz}>
          Take Another Quiz
        </button>
      </div>
    </div>
  );
}


  if (questions.length === 0) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <p>No questions available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <div className="quiz-header">
          <h2 className="quiz-title">Question</h2>
          <span className="quiz-progress">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <p className="quiz-question">{questions[currentIndex].question}</p>

        <ul className="quiz-options">
          {questions[currentIndex].options.map((opt, i) => (
            <li
              key={i}
              className={`quiz-option ${selected === opt ? "selected" : ""}`}
              onClick={() => handleOptionClick(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>

        <div className="quiz-actions">
          <button
            className="next-btn"
            onClick={handleNext}
            disabled={!selected}
          >
            {currentIndex === questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quiz;