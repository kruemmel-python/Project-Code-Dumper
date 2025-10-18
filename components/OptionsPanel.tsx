
import React from 'react';
import { DumpOptions, BinaryMode, SortMode, Preset } from '../types';
import { PRESETS } from '../constants';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Checkbox } from './ui/Checkbox';
import { useTranslation, TranslationKey } from '../i18n';

type PresetTranslationKey = `presets.${typeof PRESETS[number]['name']}`;

interface OptionsPanelProps {
    options: DumpOptions;
    setOptions: React.Dispatch<React.SetStateAction<DumpOptions>>;
    onPresetChange: (preset: Preset) => void;
    disabled: boolean;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, setOptions, onPresetChange, disabled }) => {
    const { t } = useTranslation();

    const handleOptionChange = <K extends keyof DumpOptions>(key: K, value: DumpOptions[K]) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };
    
    const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const preset = PRESETS.find(p => p.name === e.target.value);
        if (preset) {
            onPresetChange(preset);
        }
    };
    
    const handleListChange = (key: 'include' | 'exclude', value: string) => {
        handleOptionChange(key, value.split('\n').filter(line => line.trim() !== ''));
    };

    return (
        <Card className="h-full overflow-y-auto">
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('options.configuration')}</h2>

                <div>
                    <Label htmlFor="preset">{t('options.preset')}</Label>
                    <Select id="preset" onChange={handlePresetSelect} disabled={disabled}>
                        <option value="">{t('options.preset.custom')}</option>
                        {PRESETS.map(p => {
                            const presetKey = `presets.${p.name}` as PresetTranslationKey & TranslationKey;
                            return <option key={p.name} value={p.name}>{t(presetKey)}</option>;
                        })}
                    </Select>
                </div>

                <div>
                    <Label htmlFor="include">{t('options.include.label')}</Label>
                    <Textarea
                        id="include"
                        rows={4}
                        value={options.include.join('\n')}
                        onChange={e => handleListChange('include', e.target.value)}
                        placeholder={t('options.include.placeholder')}
                        disabled={disabled}
                    />
                </div>

                <div>
                    <Label htmlFor="exclude">{t('options.exclude.label')}</Label>
                    <Textarea
                        id="exclude"
                        rows={4}
                        value={options.exclude.join('\n')}
                        onChange={e => handleListChange('exclude', e.target.value)}
                        placeholder={t('options.exclude.placeholder')}
                        disabled={disabled}
                    />
                </div>

                <div>
                    <Label htmlFor="maxSize">{t('options.maxSize.label')}</Label>
                    <Input
                        id="maxSize"
                        type="number"
                        value={options.maxSize === null ? '' : options.maxSize}
                        onChange={e => handleOptionChange('maxSize', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                        placeholder={t('options.maxSize.placeholder')}
                        disabled={disabled}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="binaryMode">{t('options.binaryMode.label')}</Label>
                        <Select
                            id="binaryMode"
                            value={options.binaryMode}
                            onChange={e => handleOptionChange('binaryMode', e.target.value as BinaryMode)}
                            disabled={disabled}
                        >
                            <option value="skip">{t('options.binaryMode.skip')}</option>
                            <option value="hex">{t('options.binaryMode.hex')}</option>
                            <option value="base64">{t('options.binaryMode.base64')}</option>
                            <option value="bytes">{t('options.binaryMode.bytes')}</option>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="sort">{t('options.sort.label')}</Label>
                        <Select
                            id="sort"
                            value={options.sort}
                            onChange={e => handleOptionChange('sort', e.target.value as SortMode)}
                            disabled={disabled}
                        >
                            <option value="path">{t('options.sort.path')}</option>
                            <option value="size">{t('options.sort.size')}</option>
                            <option value="time">{t('options.sort.time')}</option>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <Checkbox
                        id="showMetadata"
                        label={t('options.showMetadata')}
                        checked={options.showMetadata}
                        onChange={e => handleOptionChange('showMetadata', e.target.checked)}
                        disabled={disabled}
                    />
                    <Checkbox
                        id="strictText"
                        label={t('options.strictText')}
                        checked={options.strictText}
                        onChange={e => handleOptionChange('strictText', e.target.checked)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </Card>
    );
};
