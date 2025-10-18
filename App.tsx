
import React, { useState, useCallback, useMemo } from 'react';
import { DumpOptions, Preset } from './types';
import { PRESETS } from './constants';
import { createCodeDump } from './services/zipProcessor';
import { OptionsPanel } from './components/OptionsPanel';
import { FileUpload } from './components/FileUpload';
import { OutputDisplay } from './components/OutputDisplay';

const defaultOptions: DumpOptions = {
    include: ['**/*'],
    exclude: [],
    maxSize: 2000000,
    binaryMode: 'skip',
    showMetadata: true,
    sort: 'path',
    strictText: false,
};

const LoadingIndicator: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-lg">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Processing ZIP file...</p>
        <div className="w-1/2 mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{progress}% complete</p>
    </div>
);


function App() {
    const [options, setOptions] = useState<DumpOptions>(defaultOptions);
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [output, setOutput] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handlePresetChange = useCallback((preset: Preset) => {
        const newOptions: DumpOptions = {
            ...defaultOptions,
            include: preset.options.include || [],
            exclude: preset.options.exclude || [],
            maxSize: preset.options.maxSize !== undefined ? preset.options.maxSize : defaultOptions.maxSize,
            binaryMode: preset.options.binaryMode || defaultOptions.binaryMode,
            showMetadata: preset.options.showMetadata !== undefined ? preset.options.showMetadata : defaultOptions.showMetadata,
            sort: preset.options.sort || defaultOptions.sort,
            strictText: preset.options.strictText !== undefined ? preset.options.strictText : defaultOptions.strictText,
        };
        setOptions(newOptions);
    }, []);
    
    const handleFileSelect = useCallback((file: File) => {
        if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
            setZipFile(file);
        } else {
            alert('Please select a valid ZIP file.');
        }
    }, []);

    const handleGenerate = async () => {
        if (!zipFile) {
            alert('Please select a ZIP file first.');
            return;
        }
        setIsLoading(true);
        setProgress(0);
        try {
            const results = await createCodeDump(zipFile, options, setProgress);
            const header = `# CodeDump for Project: \`${zipFile.name}\`\n\n_Generated on ${new Date().toISOString()}_\n\n`;
            const markdownContent = header + results.map(r => r.markdown).join('');
            setOutput(markdownContent);
        } catch (error) {
            console.error('Failed to process ZIP file:', error);
            alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setOutput(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setZipFile(null);
        setOutput(null);
        setIsLoading(false);
        setProgress(0);
    };

    const memoizedOptionsPanel = useMemo(() => (
        <OptionsPanel 
            options={options} 
            setOptions={setOptions} 
            onPresetChange={handlePresetChange}
            disabled={isLoading}
        />
    ), [options, handlePresetChange, isLoading]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 lg:p-8 font-sans">
            <main className="max-w-screen-2xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">CodeDump from ZIP</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Generate a comprehensive Markdown file from your project's ZIP archive.</p>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
                    <div className="lg:col-span-1 h-full">
                        {memoizedOptionsPanel}
                    </div>
                    <div className="lg:col-span-2 h-full">
                       {isLoading ? (
                           <LoadingIndicator progress={progress} />
                       ) : output !== null ? (
                           <OutputDisplay content={output} filename={zipFile?.name || 'codedump'} onReset={handleReset} />
                       ) : (
                           <div className="flex flex-col h-full gap-6">
                               <div className="flex-grow">
                                   <FileUpload onFileSelect={handleFileSelect} disabled={isLoading} />
                               </div>
                               {zipFile && (
                                   <div className="flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex justify-between items-center">
                                       <p className="text-sm font-medium">Selected: <span className="font-bold text-blue-600 dark:text-blue-400">{zipFile.name}</span></p>
                                       <button 
                                           onClick={handleGenerate}
                                           className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                       >
                                           Generate CodeDump
                                       </button>
                                   </div>
                               )}
                           </div>
                       )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
