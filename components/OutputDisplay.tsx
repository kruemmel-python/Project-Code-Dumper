
import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';

interface OutputDisplayProps {
    content: string;
    filename: string;
    onReset: () => void;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, filename, onReset }) => {
    
    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'codedump.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generated CodeDump</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleCopy} variant="secondary" leftIcon={<CopyIcon />}>Copy</Button>
                    <Button onClick={handleDownload} variant="primary" leftIcon={<DownloadIcon />}>Download</Button>
                    <Button onClick={onReset} variant="secondary">New Dump</Button>
                </div>
            </div>
            <div className="flex-grow">
                <Textarea readOnly value={content} className="resize-none font-mono text-sm" />
            </div>
        </Card>
    );
};
