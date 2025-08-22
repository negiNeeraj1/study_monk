import { 
  Users, 
  BookOpen, 
  Brain, 
  TrendingUp, 
  Star,
  Clock,
  Award,
  FileText,
  BarChart3,
  Activity
} from 'lucide-react';

// Dashboard stats data
export const dashboardData = {
  stats: [
    {
      id: 'total-users',
      title: 'Total Users',
      value: 12450,
      change: 12.5,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: 'Registered students'
    },
    {
      id: 'active-materials',
      title: 'Study Materials',
      value: 1280,
      change: 8.2,
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600',
      description: 'Available materials'
    },
    {
      id: 'quiz-completions',
      title: 'Quiz Completions',
      value: 8760,
      change: -3.1,
      icon: Brain,
      color: 'from-green-500 to-green-600',
      description: 'This month'
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: 45000,
      change: 15.8,
      icon: TrendingUp,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Monthly revenue'
    }
  ],

  // Chart data for analytics
  chartData: [
    { month: 'Jan', students: 1200, materials: 180, quizzes: 650 },
    { month: 'Feb', students: 1350, materials: 220, quizzes: 720 },
    { month: 'Mar', students: 1580, materials: 280, quizzes: 890 },
    { month: 'Apr', students: 1420, materials: 260, quizzes: 780 },
    { month: 'May', students: 1680, materials: 310, quizzes: 920 },
    { month: 'Jun', students: 1890, materials: 340, quizzes: 1050 },
    { month: 'Jul', students: 2100, materials: 390, quizzes: 1180 },
    { month: 'Aug', students: 2350, materials: 420, quizzes: 1290 },
    { month: 'Sep', students: 2580, materials: 480, quizzes: 1420 },
    { month: 'Oct', students: 2720, materials: 510, quizzes: 1580 },
    { month: 'Nov', students: 2950, materials: 560, quizzes: 1650 },
    { month: 'Dec', students: 3200, materials: 620, quizzes: 1780 }
  ],

  // Pie chart data for subject distribution
  pieData: [
    { name: 'Mathematics', value: 35, color: '#3B82F6' },
    { name: 'Science', value: 28, color: '#8B5CF6' },
    { name: 'English', value: 20, color: '#10B981' },
    { name: 'History', value: 12, color: '#F59E0B' },
    { name: 'Others', value: 5, color: '#EF4444' }
  ],

  // User activity data
  userActivity: [
    { time: '00:00', active: 120 },
    { time: '04:00', active: 80 },
    { time: '08:00', active: 450 },
    { time: '12:00', active: 680 },
    { time: '16:00', active: 590 },
    { time: '20:00', active: 320 },
    { time: '24:00', active: 180 }
  ],

  // Performance metrics
  performanceMetrics: [
    { 
      label: 'User Retention', 
      value: 87.3, 
      target: 90, 
      color: 'text-green-600',
      icon: Users 
    },
    { 
      label: 'Course Completion', 
      value: 73.8, 
      target: 80, 
      color: 'text-blue-600',
      icon: Award 
    },
    { 
      label: 'Avg Session Time', 
      value: 24.5, 
      target: 30, 
      color: 'text-purple-600',
      icon: Clock 
    },
    { 
      label: 'Quiz Success Rate', 
      value: 82.1, 
      target: 85, 
      color: 'text-yellow-600',
      icon: Star 
    }
  ]
};

// User management data
export const usersData = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    avatar: null,
    role: 'Student',
    status: 'Active',
    joinDate: '2024-01-15',
    lastActive: '2 hours ago',
    coursesEnrolled: 8,
    completionRate: 85,
    totalQuizzes: 45,
    averageScore: 87.5
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    avatar: null,
    role: 'Premium Student',
    status: 'Active',
    joinDate: '2023-11-22',
    lastActive: '1 day ago',
    coursesEnrolled: 12,
    completionRate: 92,
    totalQuizzes: 78,
    averageScore: 91.2
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    avatar: null,
    role: 'Student',
    status: 'Inactive',
    joinDate: '2024-02-08',
    lastActive: '2 weeks ago',
    coursesEnrolled: 3,
    completionRate: 45,
    totalQuizzes: 12,
    averageScore: 73.8
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    avatar: null,
    role: 'Instructor',
    status: 'Active',
    joinDate: '2023-09-10',
    lastActive: 'Online now',
    coursesCreated: 15,
    studentsReached: 2450,
    averageRating: 4.8,
    totalEarnings: 15600
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    email: 'lisa.thompson@email.com',
    avatar: null,
    role: 'Premium Student',
    status: 'Active',
    joinDate: '2023-12-05',
    lastActive: '30 minutes ago',
    coursesEnrolled: 18,
    completionRate: 78,
    totalQuizzes: 96,
    averageScore: 89.3
  }
];

// Study materials data
export const materialsData = [
  {
    id: 1,
    title: 'Advanced Calculus Fundamentals',
    description: 'Comprehensive guide to advanced calculus concepts including limits, derivatives, and integrals.',
    category: 'Mathematics',
    type: 'PDF',
    size: '12.5 MB',
    uploadDate: '2024-01-10',
    downloads: 1250,
    rating: 4.8,
    tags: ['calculus', 'mathematics', 'advanced', 'derivatives'],
    status: 'Published',
    author: 'Dr. Sarah Wilson',
    difficulty: 'Advanced'
  },
  {
    id: 2,
    title: 'Organic Chemistry Lab Manual',
    description: 'Step-by-step laboratory procedures and safety guidelines for organic chemistry experiments.',
    category: 'Chemistry',
    type: 'PDF',
    size: '8.3 MB',
    uploadDate: '2024-01-15',
    downloads: 890,
    rating: 4.6,
    tags: ['chemistry', 'organic', 'lab', 'experiments'],
    status: 'Published',
    author: 'Prof. Michael Chen',
    difficulty: 'Intermediate'
  },
  {
    id: 3,
    title: 'World War II Historical Analysis',
    description: 'In-depth analysis of World War II events, causes, and consequences.',
    category: 'History',
    type: 'Video',
    duration: '2h 45m',
    uploadDate: '2024-01-20',
    views: 2340,
    rating: 4.9,
    tags: ['history', 'world war', 'analysis', 'documentary'],
    status: 'Published',
    author: 'Dr. Emily Rodriguez',
    difficulty: 'Beginner'
  },
  {
    id: 4,
    title: 'Python Programming Basics',
    description: 'Complete beginner\'s guide to Python programming with hands-on examples.',
    category: 'Computer Science',
    type: 'Interactive',
    modules: 12,
    uploadDate: '2024-01-25',
    enrollments: 3450,
    rating: 4.7,
    tags: ['programming', 'python', 'basics', 'coding'],
    status: 'Published',
    author: 'David Kumar',
    difficulty: 'Beginner'
  },
  {
    id: 5,
    title: 'Shakespeare Literary Collection',
    description: 'Complete works of William Shakespeare with modern interpretations and analysis.',
    category: 'Literature',
    type: 'eBook',
    pages: 1200,
    uploadDate: '2024-02-01',
    downloads: 650,
    rating: 4.5,
    tags: ['literature', 'shakespeare', 'classic', 'drama'],
    status: 'Draft',
    author: 'Prof. Jane Austin',
    difficulty: 'Advanced'
  }
];

// Quiz data
export const quizzesData = [
  {
    id: 1,
    title: 'Calculus Fundamentals Quiz',
    description: 'Test your understanding of basic calculus concepts',
    category: 'Mathematics',
    difficulty: 'Intermediate',
    questions: 25,
    timeLimit: 45,
    attempts: 1250,
    averageScore: 78.5,
    passRate: 68,
    status: 'Active',
    createdDate: '2024-01-10',
    tags: ['calculus', 'math', 'derivatives', 'limits']
  },
  {
    id: 2,
    title: 'Organic Chemistry Reactions',
    description: 'Comprehensive quiz on organic chemistry reaction mechanisms',
    category: 'Chemistry',
    difficulty: 'Advanced',
    questions: 30,
    timeLimit: 60,
    attempts: 890,
    averageScore: 72.3,
    passRate: 58,
    status: 'Active',
    createdDate: '2024-01-15',
    tags: ['chemistry', 'organic', 'reactions', 'mechanisms']
  },
  {
    id: 3,
    title: 'World History Timeline',
    description: 'Test your knowledge of major historical events and timelines',
    category: 'History',
    difficulty: 'Beginner',
    questions: 20,
    timeLimit: 30,
    attempts: 2100,
    averageScore: 85.7,
    passRate: 82,
    status: 'Active',
    createdDate: '2024-01-20',
    tags: ['history', 'timeline', 'events', 'dates']
  },
  {
    id: 4,
    title: 'Python Syntax Mastery',
    description: 'Master Python programming syntax and basic concepts',
    category: 'Computer Science',
    difficulty: 'Beginner',
    questions: 40,
    timeLimit: 50,
    attempts: 3200,
    averageScore: 82.1,
    passRate: 75,
    status: 'Active',
    createdDate: '2024-01-25',
    tags: ['programming', 'python', 'syntax', 'basics']
  },
  {
    id: 5,
    title: 'Shakespeare Analysis',
    description: 'Analyze themes and literary devices in Shakespeare\'s works',
    category: 'Literature',
    difficulty: 'Advanced',
    questions: 15,
    timeLimit: 40,
    attempts: 450,
    averageScore: 76.8,
    passRate: 62,
    status: 'Draft',
    createdDate: '2024-02-01',
    tags: ['literature', 'shakespeare', 'analysis', 'themes']
  }
];

// Recent activities
export const recentActivities = [
  {
    id: 1,
    type: 'user_registration',
    description: 'New user Sarah Johnson registered',
    timestamp: '2 hours ago',
    icon: Users,
    color: 'text-green-600 bg-green-100'
  },
  {
    id: 2,
    type: 'material_upload',
    description: 'New study material "Advanced Physics" uploaded',
    timestamp: '4 hours ago',
    icon: FileText,
    color: 'text-blue-600 bg-blue-100'
  },
  {
    id: 3,
    type: 'quiz_completion',
    description: '125 students completed Calculus Quiz',
    timestamp: '6 hours ago',
    icon: Brain,
    color: 'text-purple-600 bg-purple-100'
  },
  {
    id: 4,
    type: 'system_update',
    description: 'System maintenance completed successfully',
    timestamp: '1 day ago',
    icon: Activity,
    color: 'text-gray-600 bg-gray-100'
  },
  {
    id: 5,
    type: 'achievement',
    description: 'Platform reached 10,000 active users milestone',
    timestamp: '2 days ago',
    icon: Award,
    color: 'text-yellow-600 bg-yellow-100'
  }
];

// System notifications
export const systemNotifications = [
  {
    id: 1,
    title: 'Server Maintenance Scheduled',
    message: 'Planned maintenance on Sunday, 2 AM - 4 AM EST',
    type: 'warning',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: 2,
    title: 'New Feature Released',
    message: 'Interactive whiteboard feature is now available for all users',
    type: 'info',
    timestamp: '3 hours ago',
    read: false
  },
  {
    id: 3,
    title: 'Security Update',
    message: 'Security patches have been applied successfully',
    type: 'success',
    timestamp: '1 day ago',
    read: true
  },
  {
    id: 4,
    title: 'Storage Warning',
    message: 'Server storage is 85% full. Consider upgrading storage plan',
    type: 'error',
    timestamp: '2 days ago',
    read: true
  }
];

export default {
  dashboardData,
  usersData,
  materialsData,
  quizzesData,
  recentActivities,
  systemNotifications
};
