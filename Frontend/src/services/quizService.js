// Note: this service uses native fetch, no api client import needed
import { getApiUrl } from "../config/api";

const QUIZ_API_BASE = getApiUrl("admin");

class QuizService {
  // Get all published quizzes for students
  async getQuizzes(params = {}) {
    try {
      const queryString = new URLSearchParams({
        published: "true",
        ...params,
      }).toString();

      const response = await fetch(
        `${QUIZ_API_BASE}/admin/quizzes?${queryString}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      return await response.json();
    } catch (error) {
      console.error("Quiz service error:", error);
      throw error;
    }
  }

  // Get quiz by ID with questions
  async getQuizById(quizId) {
    try {
      const response = await fetch(`${QUIZ_API_BASE}/admin/quizzes/${quizId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quiz");
      }

      return await response.json();
    } catch (error) {
      console.error("Quiz service error:", error);
      throw error;
    }
  }

  // Submit quiz attempt
  async submitQuizAttempt(quizId, answers, timeTaken) {
    try {
      const response = await fetch(`${QUIZ_API_BASE}/quiz-attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          quizId,
          answers,
          timeTaken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      return await response.json();
    } catch (error) {
      console.error("Quiz submission error:", error);
      throw error;
    }
  }

  // Get user's quiz attempts
  async getUserAttempts(userId) {
    try {
      const response = await fetch(
        `${QUIZ_API_BASE}/quiz-attempts/user/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user attempts");
      }

      return await response.json();
    } catch (error) {
      console.error("Quiz attempts error:", error);
      throw error;
    }
  }

  // Get quiz statistics for user
  async getQuizStats(quizId) {
    try {
      const response = await fetch(
        `${QUIZ_API_BASE}/admin/quizzes/${quizId}/stats`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quiz stats");
      }

      return await response.json();
    } catch (error) {
      console.error("Quiz stats error:", error);
      throw error;
    }
  }
}

export const quizService = new QuizService();
export default quizService;
