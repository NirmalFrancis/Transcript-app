import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Brain, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Download,
  Share
} from 'lucide-react';

interface AISummaryProps {
  audioName: string;
  duration: number;
}

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

interface KeyPoint {
  id: string;
  topic: string;
  description: string;
  timestamp: number;
  importance: 'high' | 'medium' | 'low';
}

interface SentimentData {
  overall: 'positive' | 'neutral' | 'negative';
  score: number;
  highlights: string[];
}

// Mock AI-generated data
const mockActionItems: ActionItem[] = [
  {
    id: '1',
    task: 'Coordinate deployment schedule between frontend and backend teams',
    assignee: 'Mike Rodriguez & Emily Watson',
    priority: 'high',
    timestamp: 94.6
  },
  {
    id: '2',
    task: 'Complete OAuth integration testing and documentation',
    assignee: 'Mike Rodriguez',
    priority: 'medium',
    timestamp: 32.1
  },
  {
    id: '3',
    task: 'Finalize dashboard dark mode implementation',
    assignee: 'Emily Watson',
    priority: 'medium',
    timestamp: 48.7
  },
  {
    id: '4',
    task: 'Monitor API performance metrics post-optimization',
    assignee: 'David Kim',
    priority: 'low',
    timestamp: 67.3
  }
];

const mockKeyPoints: KeyPoint[] = [
  {
    id: '1',
    topic: 'Authentication System Completion',
    description: 'OAuth integration with Google and GitHub is complete with 94% test coverage',
    timestamp: 25.0,
    importance: 'high'
  },
  {
    id: '2',
    topic: 'Dashboard Performance Improvements',
    description: 'New charts are 40% faster with dark mode toggle implementation',
    timestamp: 40.0,
    importance: 'high'
  },
  {
    id: '3',
    topic: 'API Optimization Success',
    description: '60% reduction in response times and improved error handling',
    timestamp: 58.0,
    importance: 'high'
  },
  {
    id: '4',
    topic: 'Deployment Coordination Needed',
    description: 'Frontend and backend teams need to synchronize release schedule',
    timestamp: 87.0,
    importance: 'medium'
  }
];

const mockSentiment: SentimentData = {
  overall: 'positive',
  score: 0.82,
  highlights: [
    'Team members are making excellent progress',
    'Collaborative problem-solving approach',
    'Proactive communication about potential blockers'
  ]
};

export function AISummary({ audioName, duration, onTimeJump }: AISummaryProps & { onTimeJump: (time: number) => void }) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high': return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-medium">AI Meeting Summary</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{formatTime(duration)}</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* <Users className="w-4 h-4 text-muted-foreground" /> */}
            {/* <span className="text-muted-foreground">Participants:</span>
            <span className="font-medium">4 people</span> */}
          </div>
          <div className="flex items-center space-x-2">
            {/* <Brain className="w-4 h-4 text-muted-foreground" /> */}
            {/* <span className="text-muted-foreground">Sentiment:</span> */}
            {/* <span className={`font-medium capitalize ${getSentimentColor(mockSentiment.overall)}`}>
              {mockSentiment.overall} ({Math.round(mockSentiment.score * 100)}%)
            </span> */}
          </div>
        </div>
      </Card>

      {/* Action Items */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h4 className="font-medium">Action Items</h4>
          <Badge variant="secondary">{mockActionItems.length}</Badge>
        </div>

        <div className="space-y-3">
          {mockActionItems.map((item) => (
            <div 
              key={item.id}
              className="p-3 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => onTimeJump(item.timestamp)}
            >
              <div className="flex items-start justify-between mb-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPriorityColor(item.priority)}`}
                >
                  {item.priority} priority
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimeJump(item.timestamp);
                  }}
                >
                  {formatTime(item.timestamp)}
                </Button>
              </div>
              <p className="text-sm mb-2">{item.task}</p>
              <p className="text-xs text-muted-foreground">
                Assigned to: <span className="font-medium">{item.assignee}</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Discussion Points */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h4 className="font-medium">Key Discussion Points</h4>
        </div>

        <div className="space-y-3">
          {mockKeyPoints.map((point) => (
            <div 
              key={point.id}
              className="p-3 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => onTimeJump(point.timestamp)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getImportanceIcon(point.importance)}
                  <span className="font-medium text-sm">{point.topic}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimeJump(point.timestamp);
                  }}
                >
                  {formatTime(point.timestamp)}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Meeting Sentiment */}
      {/* <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-5 h-5 text-purple-600" />
          <h4 className="font-medium">Meeting Sentiment Analysis</h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Sentiment</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${mockSentiment.score * 100}%` }}
                />
              </div>
              <span className={`text-sm font-medium capitalize ${getSentimentColor(mockSentiment.overall)}`}>
                {mockSentiment.overall}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Key Sentiment Highlights:</p>
            <ul className="space-y-1">
              {mockSentiment.highlights.map((highlight, index) => (
                <li key={index} className="text-sm flex items-start space-x-2">
                  <CheckCircle className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card> */}
    </div>
  );
}