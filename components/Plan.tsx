
import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Bot, FileText, Loader } from 'lucide-react';
import { analyzeBudgetPlan } from '../services/geminiService';
import { useAppContext } from '../hooks/useAppContext';
import Card from './common/Card';
import Modal from './common/Modal';

const Plan: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { budgetPlan } = state;
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                dispatch({
                    type: 'UPLOAD_BUDGET_PLAN',
                    payload: { fileName: file.name, content },
                });
            };
            reader.readAsText(file);
        }
    };

    const handleGetFeedback = async () => {
        if (!budgetPlan.content) return;
        setIsLoading(true);
        setFeedback(null);
        try {
            const result = await analyzeBudgetPlan(budgetPlan.content);
            setFeedback(result);
            setIsFeedbackModalOpen(true);
        } catch (error) {
            console.error(error);
            setFeedback("An error occurred while getting feedback.");
            setIsFeedbackModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold text-brand-white">My Budget Plan</h1>
            <Card>
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-brand-light-navy rounded-lg text-center">
                    <UploadCloud size={48} className="text-brand-accent mb-4" />
                    <h2 className="text-xl font-semibold text-brand-white">Upload Your Plan</h2>
                    <p className="text-brand-slate mt-2 mb-4">
                        Upload your human-written budget plan (.txt file) to get AI-powered feedback.
                    </p>
                    <label htmlFor="budget-plan-upload" className="cursor-pointer bg-brand-accent text-brand-dark font-semibold py-2 px-4 rounded-md hover:bg-brand-accent-dark transition-colors duration-300">
                        Choose File
                    </label>
                    <input id="budget-plan-upload" type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
                </div>

                {budgetPlan.fileName && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6"
                    >
                        <div className="bg-brand-light-navy/50 p-4 rounded-md flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="text-brand-slate" />
                                <span className="text-brand-white font-medium">{budgetPlan.fileName}</span>
                            </div>
                            <button
                                onClick={handleGetFeedback}
                                disabled={isLoading}
                                className="bg-brand-accent text-brand-dark font-semibold py-2 px-4 rounded-md hover:bg-brand-accent-dark transition-colors duration-300 flex items-center gap-2 disabled:bg-brand-slate disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="animate-spin" size={18} />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Bot size={18} />
                                        Get AI Feedback
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </Card>

            <Modal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} title="AI Budget Coach Feedback">
                {feedback && (
                    <div
                        className="prose prose-invert max-w-none text-brand-light-slate"
                        dangerouslySetInnerHTML={{
                             __html: feedback.replace(/\n/g, '<br />')
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default Plan;
