"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Play, 
  Loader2, 
  Code, 
  Brain,
  Lightbulb,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import GoldButton from "@/components/ui/GoldButton";
import Card from "@/components/ui/Card";
import ReactMarkdown from "react-markdown";

interface Topic {
  title: string;
  description: string;
  isCompleted: boolean;
  order: number;
}

interface Roadmap {
  _id: string;
  goal: string;
  description: string;
  topics: Topic[];
  difficulty: string;
}

interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface LessonContent {
  content: string;
  codeExample: string;
  takeaway: string;
  quiz: QuizItem[];
}

export default function RoadmapViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [currentTopicIdx, setCurrentTopicIdx] = useState(0);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch(`/api/roadmap/${id}`);
      const data = await res.json();
      if (res.ok) {
        setRoadmap(data.roadmap);
        // Find first incomplete topic
        const firstIncomplete = data.roadmap.topics.findIndex((t: Topic) => !t.isCompleted);
        setCurrentTopicIdx(firstIncomplete !== -1 ? firstIncomplete : 0);
      }
    } catch (error) {
      console.error("Failed to fetch roadmap:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roadmap) {
      generateContent();
    }
  }, [currentTopicIdx, roadmap?._id]);

  const generateContent = async () => {
    if (!roadmap) return;
    setGenerating(true);
    setLessonContent(null);
    setSelectedAnswer(null);
    setQuizSubmitted(false);

    try {
      const res = await fetch("/api/roadmap/topic-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roadmapId: roadmap._id, 
          topicTitle: roadmap.topics[currentTopicIdx].title 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLessonContent(data.lesson);
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCompleteTopic = async () => {
    if (!roadmap) return;
    try {
      const res = await fetch("/api/roadmap/update-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roadmapId: roadmap._id, 
          topicIdx: currentTopicIdx,
          isCompleted: true
        }),
      });
      if (res.ok) {
        const updatedTopics = [...roadmap.topics];
        updatedTopics[currentTopicIdx].isCompleted = true;
        setRoadmap({ ...roadmap, topics: updatedTopics });
        
        if (currentTopicIdx < roadmap.topics.length - 1) {
          setCurrentTopicIdx(currentTopicIdx + 1);
        }
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-gold" />
      </div>
    );
  }

  if (!roadmap) return null;

  const currentTopic = roadmap.topics[currentTopicIdx];

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar - Roadmap Progress */}
          <div className="lg:w-1/3">
            <Link 
              href="/learning-hub" 
              className="inline-flex items-center gap-2 text-gold text-sm font-bold uppercase tracking-widest mb-8 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Hub
            </Link>

            <Card className="p-8 bg-surface border-border-gold sticky top-32">
              <h2 className="font-display text-2xl text-text-primary mb-2">{roadmap.goal}</h2>
              <p className="text-text-muted text-xs uppercase tracking-widest font-bold mb-8">
                {roadmap.difficulty} Path
              </p>

              <div className="space-y-6">
                {roadmap.topics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTopicIdx(idx)}
                    className={`w-full flex items-start gap-4 text-left group transition-all ${
                      idx === currentTopicIdx ? "opacity-100" : "opacity-50 hover:opacity-80"
                    }`}
                  >
                    <div className="mt-1">
                      {topic.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : idx === currentTopicIdx ? (
                        <Play className="w-5 h-5 text-gold animate-pulse" />
                      ) : (
                        <Circle className="w-5 h-5 text-gold/30" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-bold uppercase tracking-tight ${
                        idx === currentTopicIdx ? "text-gold" : "text-text-primary"
                      }`}>
                        {topic.title}
                      </p>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">
                        Topic {idx + 1}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content - Lesson Viewer */}
          <div className="lg:w-2/3">
            <AnimatePresence mode="wait">
              {generating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <Brain className="w-16 h-16 text-gold mb-6 animate-bounce" />
                  <h3 className="font-display text-3xl text-text-primary mb-2">Synthesizing Lesson</h3>
                  <p className="text-text-muted italic">Tailoring elite content for your personal roadmap...</p>
                </motion.div>
              ) : lessonContent ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  {/* Lesson Header */}
                  <div>
                    <h1 className="font-display text-4xl md:text-5xl text-text-primary mb-4">
                      {currentTopic.title}
                    </h1>
                    <div className="w-20 h-1 bg-gold rounded-full" />
                  </div>

                  {/* Markdown Content */}
                  <Card className="p-8 bg-surface/50 border-border-gold/30 prose prose-invert max-w-none">
                    <ReactMarkdown>{lessonContent.content}</ReactMarkdown>
                  </Card>

                  {/* Code Example */}
                  <Card className="p-8 bg-black/40 border-border-gold/20 font-mono text-sm overflow-x-auto">
                    <div className="flex items-center gap-2 text-gold mb-4 text-xs font-bold uppercase tracking-widest">
                      <Code className="w-4 h-4" />
                      Practical Application
                    </div>
                    <pre className="text-emerald-400 whitespace-pre-wrap">{lessonContent.codeExample}</pre>
                  </Card>

                  {/* Key Takeaway */}
                  <div className="bg-gold/5 border-l-4 border-gold p-6 rounded-r-xl">
                    <div className="flex items-center gap-2 text-gold mb-2 text-xs font-bold uppercase tracking-widest">
                      <Lightbulb className="w-4 h-4" />
                      Key Takeaway
                    </div>
                    <p className="text-text-primary italic leading-relaxed">
                      {lessonContent.takeaway}
                    </p>
                  </div>

                  {/* Quiz Section */}
                  <div className="space-y-6 pt-12 border-t border-border-gold/20">
                    <h3 className="font-display text-3xl text-text-primary flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-gold" />
                      Knowledge Check
                    </h3>
                    
                    <div className="space-y-8">
                      {lessonContent.quiz.map((q, qIdx) => (
                        <Card key={qIdx} className="p-6 bg-surface border-border-gold/30">
                          <p className="text-text-primary font-medium mb-4">{q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((option, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => !quizSubmitted && setSelectedAnswer(oIdx)}
                                className={`p-4 rounded-xl text-left text-sm transition-all border ${
                                  selectedAnswer === oIdx 
                                    ? "bg-gold/20 border-gold text-gold" 
                                    : "bg-white/5 border-white/10 text-text-muted hover:border-gold/30"
                                } ${
                                  quizSubmitted && oIdx === q.correctAnswer
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                                    : quizSubmitted && selectedAnswer === oIdx && oIdx !== q.correctAnswer
                                    ? "bg-red-500/20 border-red-500 text-red-500"
                                    : ""
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-8">
                      <div className="flex gap-4">
                        <GoldButton
                          variant="ghost"
                          disabled={currentTopicIdx === 0}
                          onClick={() => setCurrentTopicIdx(currentTopicIdx - 1)}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Previous Topic
                        </GoldButton>
                      </div>

                      <div className="flex gap-4">
                        {!currentTopic.isCompleted && (
                          <GoldButton
                            variant="filled"
                            onClick={handleCompleteTopic}
                          >
                            Mark Topic Complete
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </GoldButton>
                        )}
                        {currentTopic.isCompleted && currentTopicIdx < roadmap.topics.length - 1 && (
                          <GoldButton
                            variant="filled"
                            onClick={() => setCurrentTopicIdx(currentTopicIdx + 1)}
                          >
                            Next Topic
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </GoldButton>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-32">
                  <p className="text-text-muted">Failed to generate content. Please try refreshing.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
