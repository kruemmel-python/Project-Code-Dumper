
import React from 'react';
import { Card } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { useTranslation } from '../i18n';

interface OutputDisplayProps {
    content: string;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ content }) => {
    const { t } = useTranslation();

    return (
        <Card className="h-full w-full flex flex-col">
            <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('output.title')}</h2>
            </div>
            <div className="flex-grow min-h-[60vh] w-full">
                <Textarea
                    readOnly
                    value={content}
                    className="resize-none font-mono text-sm min-h-[60vh] w-full h-full"
                    aria-label={t('output.title')}
                />
            </div>
        </Card>
    );
};
