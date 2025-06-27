
import React, { useState, useCallback } from 'react';
import { Device, Repair } from '../types';
import { generateReport } from '../services/geminiService';

interface AiAssistantProps {
    devices: Device[];
    repairs: Repair[];
}

const AiAssistant: React.FC<AiAssistantProps> = ({ devices, repairs }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');

    const handleQuery = useCallback(async () => {
        if (!query.trim()) return;
        
        setIsLoading(true);
        setError('');
        setResponse('');

        try {
            const result = await generateReport(devices, repairs, query);
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [query, devices, repairs]);

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
    }
    
    const suggestions = [
        "Which devices are out of warranty?",
        "Summarize our spending for all of 2023.",
        "List all retired devices and their original cost.",
        "Are there any servers that need attention?",
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold mb-2 text-white">AI Assistant</h2>
            <p className="text-gray-400 mb-6">Ask questions about your inventory, and the AI will generate a report for you.</p>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., 'Show me all MacBooks in use'"
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleQuery}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
                        disabled={isLoading || !query.trim()}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            'Generate Report'
                        )}
                    </button>
                </div>
                 <div className="mt-4 flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                        <button key={i} onClick={() => handleSuggestionClick(s)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors">
                           {s}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
                    <h3 className="font-bold">Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {response && (
                <div className="mt-6 bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">AI Generated Report</h3>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap">{response}</div>
                </div>
            )}
            
            {!response && !isLoading && !error && (
                 <div className="mt-6 text-center text-gray-500 py-12">
                     <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                       <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                     </svg>
                     <h3 className="mt-2 text-sm font-medium text-gray-300">No report generated</h3>
                     <p className="mt-1 text-sm text-gray-500">Ask a question above to get started.</p>
                </div>
            )}
        </div>
    );
};

export default AiAssistant;
