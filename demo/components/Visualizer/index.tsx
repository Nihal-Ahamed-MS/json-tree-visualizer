"use client";

import { useEffect, useState } from "react";
import { SplitPane, Pane } from "react-split-pane";
import { XCircleIcon, CheckCircleIcon, SidebarIcon } from "@phosphor-icons/react";
import CodeMirror, { EditorView, Prec } from "@uiw/react-codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { oneDark } from "@codemirror/theme-one-dark";
import { getDataFromLocal, isValidJson } from "@/lib/helper";
import { DEFAULT_JSON, LOCAL_STORAGE_KEY, SIDEBAR_STATE } from "@/lib/constants";
import { SplitDivider } from "@/components/Splitter";
import { DEFAULT_OPTIONS, JsonRenderer, type RendererOptions } from "@nihal-ahamed-ms/json-tree-visualizer";
import Modal from "@/components/Modal";
import SettingsForm from "@/components/SettingsForm";

// defined at module level so CodeMirror doesn't reconfigure the editor on every render
const EDITOR_EXTENSIONS = [
    json(),
    linter(jsonParseLinter()),
    Prec.highest(
        EditorView.theme({
            "&": { fontSize: "13px", backgroundColor: "#111111" },
            ".cm-gutters": { backgroundColor: "#111111", border: "none" },
        }),
    ),
];

// the demo shows the FPS meter by default; the library keeps it off
const INITIAL_RENDERER_OPTIONS: RendererOptions = { ...DEFAULT_OPTIONS, showFps: true };

export default function Visualizer() {

    const COLLAPSED_WIDTH = 48;
    const [validJson, setValidJson] = useState(true);
    const [jsonData, setJsonData] = useState<string>(DEFAULT_JSON);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(SIDEBAR_STATE.OPEN);
    const [sidebarSize, setSidebarSize] = useState<string | number>("20%");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [rendererOptions, setRendererOptions] = useState<RendererOptions>(INITIAL_RENDERER_OPTIONS);
    const [settingsFormKey, setSettingsFormKey] = useState(0);

    useEffect(() => {
        const storedJson = getDataFromLocal(LOCAL_STORAGE_KEY.JSON_DATA) ?? DEFAULT_JSON;
        setJsonData(storedJson);
        setValidJson(isValidJson(storedJson) ?? true);

        const storedSidebar = getDataFromLocal(LOCAL_STORAGE_KEY.SIDEBAR);
        if (storedSidebar !== null) {
            setIsSidebarOpen(storedSidebar === "true");
        }
    }, []);

    const handleEditorOnChange = (value: string) => {
        setValidJson(isValidJson(value) ?? true);
        setJsonData(value);

        localStorage.setItem(LOCAL_STORAGE_KEY.JSON_DATA, value);
    };

    const handleResetSettings = () => {
        setRendererOptions(INITIAL_RENDERER_OPTIONS);
        setSettingsFormKey((key) => key + 1);
    };

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        localStorage.setItem(LOCAL_STORAGE_KEY.SIDEBAR, String(!isSidebarOpen));
    };

    return (
        <section aria-label="JSON editor and tree visualizer" className="h-screen w-full overflow-hidden bg-[#0a0a0a] text-zinc-50">
            <SplitPane
                direction="horizontal"
                resizable={isSidebarOpen}
                onResizeEnd={(sizes) => setSidebarSize(sizes[0])}
                divider={isSidebarOpen ? SplitDivider : undefined}
            >
                <Pane
                    size={isSidebarOpen ? sidebarSize : COLLAPSED_WIDTH}
                    minSize={isSidebarOpen ? "15%" : COLLAPSED_WIDTH}
                    maxSize={isSidebarOpen ? "60%" : COLLAPSED_WIDTH}
                >
                    {isSidebarOpen ? (
                        <div className="flex h-full flex-col bg-[#111111]">
                            <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
                                <button
                                    onClick={handleToggleSidebar}
                                    className="cursor-pointer rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                                    aria-label="Collapse editor"
                                >
                                    <SidebarIcon size={16} />
                                </button>
                                <span className="mt-auto mb-auto text-xs font-semibold text-zinc-600 select-none">
                                    JSON Tree
                                </span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <CodeMirror
                                    value={jsonData}
                                    height="100%"
                                    className="h-full"
                                    theme={oneDark}
                                    extensions={EDITOR_EXTENSIONS}
                                    onChange={handleEditorOnChange}
                                    basicSetup={{ highlightActiveLine: false, highlightActiveLineGutter: false }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center bg-[#111111] pt-2">
                            <button
                                onClick={handleToggleSidebar}
                                className="cursor-pointer rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                                aria-label="Expand editor"
                            >
                                <SidebarIcon size={16} />
                            </button>
                            <span className="mt-auto mb-auto -rotate-90 text-xs font-semibold text-nowrap text-zinc-600 select-none">
                                JSON Tree
                            </span>
                        </div>
                    )}
                </Pane>
                <Pane>
                    <div className="flex h-full flex-col bg-[#0a0a0a]">
                        <div className="flex-1 overflow-hidden">
                            <JsonRenderer
                                jsonData={validJson ? jsonData : ""}
                                options={rendererOptions}
                            />
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2 bg-zinc-800">
                            {jsonData ? (
                                validJson ? (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                        <CheckCircleIcon size={13} weight="fill" />
                                        Valid JSON
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                                        <XCircleIcon size={13} weight="fill" />
                                        Invalid JSON
                                    </span>
                                )
                            ) : (
                                <span />
                            )}
                            <div className="flex items-center text-xs gap-1 text-zinc-400">
                                <button
                                    onClick={() => setIsSettingsOpen(true)}
                                    className="mr-2 flex cursor-pointer items-center gap-1 transition-colors hover:text-zinc-300"
                                    aria-label="Settings"
                                >
                                    Settings
                                </button>
                                <div className="hover:text-zinc-300 flex cursor-pointer gap-1">
                                    <span className="flex items-center gap-1">
                                        Made with ❤️
                                    </span>
                                    <a
                                        href="https://github.com/Nihal-Ahamed-MS"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer flex items-center gap-1 transition-colors"
                                    >
                                        GitHub
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </Pane>
            </SplitPane>
            <Modal
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                title="Settings"
                headerActions={
                    <button
                        onClick={handleResetSettings}
                        className="cursor-pointer rounded-md border border-zinc-800 px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    >
                        Reset to defaults
                    </button>
                }
            >
                <SettingsForm
                    key={settingsFormKey}
                    value={rendererOptions}
                    onChange={setRendererOptions}
                />
            </Modal>
        </section>
    );
}
