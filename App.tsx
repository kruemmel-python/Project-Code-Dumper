
import React, { useState, useCallback, useMemo } from 'react';
import { DumpOptions, Preset } from './types';
import { createCodeDump } from './services/zipProcessor';
import { OptionsPanel } from './components/OptionsPanel';
import { FileUpload } from './components/FileUpload';
import { OutputDisplay } from './components/OutputDisplay';
import { useTranslation } from './i18n';
import { LanguageSelector } from './components/LanguageSelector';
import { Button } from './components/ui/Button';

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

const defaultOptions: DumpOptions = {
    include: ['**/*'],
    exclude: [],
    maxSize: 2000000,
    binaryMode: 'skip',
    showMetadata: true,
    sort: 'path',
    strictText: false,
};

const LoadingIndicator: React.FC<{ progress: number }> = ({ progress }) => {
    const { t } = useTranslation();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">{t('loading.processing')}</p>
            <div className="w-1/2 mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('loading.percentComplete', { percent: progress })}</p>
        </div>
    );
};


function App() {
    const [options, setOptions] = useState<DumpOptions>(defaultOptions);
    const [zipFile, setZipFile] = useState<File | null>(null);
    const [output, setOutput] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { t } = useTranslation();

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
            alert(t('app.invalidZip'));
        }
    }, [t]);

    const downloadName = useMemo(() => {
        const normalized = zipFile?.name?.replace(/\.zip$/i, '') || 'codedump';
        return `${normalized}.md`;
    }, [zipFile]);

    const handleGenerate = async () => {
        if (!zipFile) {
            alert(t('app.noZip'));
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
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert(t('app.error', { message }));
            setOutput(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = useCallback(() => {
        setZipFile(null);
        setOutput(null);
        setIsLoading(false);
        setProgress(0);
    }, []);

    const handleDownload = useCallback(() => {
        if (!output) {
            return;
        }
        const blob = new Blob([output], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [downloadName, output]);

    const handleCopy = useCallback(() => {
        if (!output) {
            return;
        }
        navigator.clipboard.writeText(output);
    }, [output]);

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
                <header className="mb-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{t('app.title')}</h1>
                            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{t('app.subtitle')}</p>
                        </div>
                        <LanguageSelector />
                    </div>
                </header>
                
                {output && !isLoading && (
                    <div className="flex flex-wrap justify-end gap-3 mb-6">
                        <Button onClick={handleCopy} variant="secondary" leftIcon={<CopyIcon />}>{t('output.copy')}</Button>
                        <Button onClick={handleDownload} variant="primary" leftIcon={<DownloadIcon />}>{t('output.download')}</Button>
                        <Button onClick={handleReset} variant="secondary">{t('output.newDump')}</Button>
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
                    <div className="h-full flex flex-col">
                        {memoizedOptionsPanel}
                    </div>
                    <div className="h-full flex flex-col">
                        {isLoading ? (
                            <LoadingIndicator progress={progress} />
                        ) : output !== null ? (
                            <OutputDisplay content={output} />
                        ) : (
                            <div className="flex flex-col h-full gap-6">
                                <div className="flex-grow">
                                    <FileUpload onFileSelect={handleFileSelect} disabled={isLoading} />
                                </div>
                                {zipFile && (
                                    <div className="flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex justify-between items-center">
                                        <p className="text-sm font-medium">{t('app.selectedFile', { filename: zipFile.name })}</p>
                                        <button
                                            onClick={handleGenerate}
                                            className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            {t('app.generate')}
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
