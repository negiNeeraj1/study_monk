// Quiz Attempt Service for managing quiz history and attempts

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://study-monk-backend.onrender.com/api";

class QuizAttemptService {
  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Create a new quiz attempt
  async createQuizAttempt(attemptData) {
    try {
      const response = await fetch(`${API_BASE}/quiz-attempts`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(attemptData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save quiz attempt: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Quiz attempt service error:", error);
      throw error;
    }
  }

  // Get user's quiz history with pagination and filters
  async getUserQuizHistory(options = {}) {
    try {
      const { page = 1, limit = 10, subject, difficulty, passed } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (subject) params.append("subject", subject);
      if (difficulty) params.append("difficulty", difficulty);
      if (passed !== undefined) params.append("passed", passed.toString());

      const response = await fetch(`${API_BASE}/quiz-attempts?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Quiz history service error:", error);
      throw error;
    }
  }

  // Get detailed quiz attempt by ID
  async getQuizAttemptById(attemptId) {
    try {
      const response = await fetch(`${API_BASE}/quiz-attempts/${attemptId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz attempt: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Quiz attempt detail service error:", error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await fetch(
        `${API_BASE}/quiz-attempts/dashboard-stats`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch dashboard stats: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Dashboard stats service error:", error);
      throw error;
    }
  }

  // Delete a quiz attempt
  async deleteQuizAttempt(attemptId) {
    try {
      const response = await fetch(`${API_BASE}/quiz-attempts/${attemptId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete quiz attempt: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Quiz attempt deletion service error:", error);
      throw error;
    }
  }

  // Get recent quiz attempts (last 5)
  async getRecentAttempts() {
    try {
      const response = await this.getUserQuizHistory({ limit: 5 });
      return response.data.attempts;
    } catch (error) {
      console.error("Recent attempts service error:", error);
      throw error;
    }
  }

  // Get performance by subject
  async getSubjectPerformance() {
    try {
      const stats = await this.getDashboardStats();
      return stats.data.subjectPerformance;
    } catch (error) {
      console.error("Subject performance service error:", error);
      throw error;
    }
  }

  // Format quiz attempt data for display
  formatQuizAttempt(attempt) {
    return {
      ...attempt,
      formattedDate: new Date(attempt.completedAt).toLocaleDateString(),
      formattedTime: new Date(attempt.completedAt).toLocaleTimeString(),
      duration: `${attempt.timeTaken} min`,
      scoreDisplay: `${attempt.score.correct}/${attempt.score.total} (${attempt.score.percentage}%)`,
      status: attempt.passed ? "Passed" : "Failed",
      statusColor: attempt.passed ? "text-green-600" : "text-red-600",
      difficultyColor:
        {
          beginner: "text-green-600",
          intermediate: "text-orange-600",
          advanced: "text-purple-600",
        }[attempt.difficulty.id] || "text-gray-600",
    };
  }

  // Get quiz statistics summary
  async getQuizSummary() {
    try {
      const stats = await this.getDashboardStats();
      const overview = stats.data.overview;

      return {
        totalQuizzes: overview.totalAttempts,
        averageScore: Math.round(overview.averageScore),
        passRate: overview.passRate,
        totalTime: overview.totalTimeTaken,
        bestScore: overview.bestScore,
        streak: stats.data.learningStreak,
      };
    } catch (error) {
      console.error("Quiz summary service error:", error);
      return {
        totalQuizzes: 0,
        averageScore: 0,
        passRate: 0,
        totalTime: 0,
        bestScore: 0,
        streak: 0,
      };
    }
  }
}

export const quizAttemptService = new QuizAttemptService();
export default quizAttemptService;
