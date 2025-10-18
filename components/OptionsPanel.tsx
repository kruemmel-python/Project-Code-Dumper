
import React from 'react';
import { DumpOptions, BinaryMode, SortMode, Preset } from '../types';
import { PRESETS } from '../constants';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Checkbox } from './ui/Checkbox';

interface OptionsPanelProps {
    options: DumpOptions;
    setOptions: React.Dispatch<React.SetStateAction<DumpOptions>>;
    onPresetChange: (preset: Preset) => void;
    disabled: boolean;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, setOptions, onPresetChange, disabled }) => {

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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuration</h2>

                <div>
                    <Label htmlFor="preset">Preset</Label>
                    <Select id="preset" onChange={handlePresetSelect} disabled={disabled}>
                        <option value="">Custom</option>
                        {PRESETS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </Select>
                </div>

                <div>
                    <Label htmlFor="include">Include Patterns (one per line)</Label>
                    <Textarea
                        id="include"
                        rows={4}
                        value={options.include.join('\n')}
                        onChange={e => handleListChange('include', e.target.value)}
                        placeholder="**/*.js&#10;**/*.tsx"
                        disabled={disabled}
                    />
                </div>

                <div>
                    <Label htmlFor="exclude">Exclude Patterns (one per line)</Label>
                    <Textarea
                        id="exclude"
                        rows={4}
                        value={options.exclude.join('\n')}
                        onChange={e => handleListChange('exclude', e.target.value)}
                        placeholder="**/node_modules/**&#10;**/dist/**"
                        disabled={disabled}
                    />
                </div>

                <div>
                    <Label htmlFor="maxSize">Max File Size (bytes)</Label>
                    <Input
                        id="maxSize"
                        type="number"
                        value={options.maxSize === null ? '' : options.maxSize}
                        onChange={e => handleOptionChange('maxSize', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                        placeholder="e.g., 1000000 for 1MB"
                        disabled={disabled}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="binaryMode">Binary Files</Label>
                        <Select
                            id="binaryMode"
                            value={options.binaryMode}
                            onChange={e => handleOptionChange('binaryMode', e.target.value as BinaryMode)}
                            disabled={disabled}
                        >
                            <option value="skip">Skip</option>
                            <option value="hex">Hex</option>
                            <option value="base64">Base64</option>
                            <option value="bytes">Bytes</option>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="sort">Sort By</Label>
                        <Select
                            id="sort"
                            value={options.sort}
                            onChange={e => handleOptionChange('sort', e.target.value as SortMode)}
                            disabled={disabled}
                        >
                            <option value="path">Path</option>
                            <option value="size">Size</option>
                            <option value="time">Time</option>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <Checkbox
                        id="showMetadata"
                        label="Show File Metadata"
                        checked={options.showMetadata}
                        onChange={e => handleOptionChange('showMetadata', e.target.checked)}
                        disabled={disabled}
                    />
                    <Checkbox
                        id="strictText"
                        label="Strict Text Decoding"
                        checked={options.strictText}
                        onChange={e => handleOptionChange('strictText', e.target.checked)}
                        disabled={disabled}
                    />
                </div>
            </div>
        </Card>
    );
};
