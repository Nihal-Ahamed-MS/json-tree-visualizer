'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import type { RendererOptions } from '@nihal-ahamed-ms/json-tree-visualizer';
import {
    DISPLAY_SECTION,
    type Field,
    type FieldPath,
    parseDraft,
    SECTIONS,
    setValue,
    toDrafts,
    toHexColor,
} from './helper';

type SettingsFormProps = {
    value: RendererOptions;
    onChange: (options: RendererOptions) => void;
};

const SettingsForm = ({ value, onChange }: SettingsFormProps) => {
    const { showFps } = value;
    const [drafts, setDrafts] = useState(() => toDrafts(value));
    const [query, setQuery] = useState('');

    const handleFieldChange = (path: FieldPath, text: string, type: Field['type']) => {
        setDrafts((prev) => ({ ...prev, [path]: text }));
        const parsed = parseDraft(text, type);
        if (parsed !== null) onChange(setValue(value, path, parsed));
    };

    const search = query.trim().toLowerCase();
    const visibleSections = SECTIONS.map((section) => ({
        ...section,
        fields:
            !search || section.title.toLowerCase().includes(search)
                ? section.fields
                : section.fields.filter(
                      ({ key, label }) =>
                          label.toLowerCase().includes(search) ||
                          key.toLowerCase().includes(search),
                  ),
    })).filter(({ fields }) => fields.length > 0);
    const isDisplayVisible =
        !search ||
        Object.values(DISPLAY_SECTION).some((text) => text.toLowerCase().includes(search));

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 py-3 px-3">
                <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-[#0a0a0a] px-2 focus-within:border-zinc-600">
                    <MagnifyingGlassIcon size={13} className="shrink-0 text-zinc-500" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search key"
                        aria-label="Search key"
                        className="w-full bg-transparent py-1.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
                    />
                </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
                {isDisplayVisible && (
                    <section className="flex flex-col gap-2">
                        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                            {DISPLAY_SECTION.title}
                        </h3>
                        <div className="flex items-center justify-between gap-3">
                            <span id="setting-showFps" className="font-roboto text-xs text-zinc-400">
                                {DISPLAY_SECTION.label}
                            </span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={showFps}
                                aria-labelledby="setting-showFps"
                                onClick={() => onChange({ ...value, showFps: !showFps })}
                                className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors ${
                                    showFps
                                        ? 'border-emerald-500 bg-emerald-500'
                                        : 'border-zinc-700 bg-zinc-800'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white transition-transform ${
                                        showFps ? 'translate-x-4' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </section>
                )}
                {visibleSections.length === 0 && !isDisplayVisible && (
                    <p className="py-6 text-center text-xs text-zinc-500">
                        No settings match &ldquo;{query}&rdquo;
                    </p>
                )}
                {visibleSections.map(({ title, fields }) => (
                    <section key={title} className="flex flex-col gap-2">
                        <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                            {title}
                        </h3>
                        {fields.map(({ key, label, type = 'number' }) => (
                            <div key={key} className="flex items-center justify-between gap-3">
                                <label
                                    htmlFor={`setting-${key}`}
                                    className="font-roboto text-xs text-zinc-400"
                                >
                                    {label}
                                </label>
                                {type === 'color' && (
                                    <label
                                        className="relative ml-auto size-5 shrink-0 cursor-pointer overflow-hidden rounded border border-zinc-700"
                                        style={{ background: drafts[key] }}
                                        title="Pick a color"
                                    >
                                        <input
                                            type="color"
                                            value={toHexColor(drafts[key])}
                                            onChange={(event) =>
                                                handleFieldChange(key, event.target.value, type)
                                            }
                                            className="absolute inset-0 cursor-pointer opacity-0"
                                            aria-label={`${label} color picker`}
                                        />
                                    </label>
                                )}
                                <input
                                    id={`setting-${key}`}
                                    type={type === 'color' ? 'text' : 'number'}
                                    step="any"
                                    spellCheck={false}
                                    value={drafts[key]}
                                    onChange={(event) =>
                                        handleFieldChange(key, event.target.value, type)
                                    }
                                    className="w-28 rounded-md border border-zinc-800 bg-[#0a0a0a] px-2 py-1 text-right text-xs text-zinc-100 tabular-nums outline-none focus:border-zinc-600"
                                />
                            </div>
                        ))}
                    </section>
                ))}
            </div>
        </div>
    );
};

export default SettingsForm;
